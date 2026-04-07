import process from "node:process";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

function preToolResponse(permissionDecision, reason, systemMessage) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision,
      permissionDecisionReason: reason,
    },
    systemMessage,
  };
}

function hasRiskyPattern(serializedInput) {
  const riskyPatterns = [
    /git\s+reset\s+--hard/i,
    /git\s+checkout\s+--/i,
    /rm\s+-rf\s+\//i,
    /drop\s+table/i,
    /truncate\s+table/i,
    /delete\s+from\s+\w+\s*;?\s*$/i,
  ];

  return riskyPatterns.find((pattern) => pattern.test(serializedInput));
}

async function main() {
  try {
    const raw = await readStdin();
    const payload = raw ? JSON.parse(raw) : {};

    const serializedInput = JSON.stringify(payload);
    const riskyMatch = hasRiskyPattern(serializedInput);

    if (riskyMatch) {
      const response = preToolResponse(
        "ask",
        "Potentially destructive action detected; require confirmation.",
        `Quality hook: risky pattern detected (${riskyMatch}). Confirm intent before running.`,
      );
      process.stdout.write(JSON.stringify(response));
      process.exit(0);
    }

    const response = preToolResponse(
      "allow",
      "No risky pattern detected.",
      "Quality hook: pre-tool checks passed.",
    );

    process.stdout.write(JSON.stringify(response));
    process.exit(0);
  } catch (error) {
    const response = preToolResponse(
      "ask",
      "Hook parsing failure; ask confirmation as safe fallback.",
      `Quality hook warning: could not parse hook input (${error.message}).`,
    );
    process.stdout.write(JSON.stringify(response));
    process.exit(0);
  }
}

await main();
