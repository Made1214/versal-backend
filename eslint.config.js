import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "prisma/migrations/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.vitest,
      },
    },
    rules: {
      "no-import-assign": "off",
    },
  },
];
