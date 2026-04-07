import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const collection = {
  info: {
    name: "Versal API - Complete",
    description: "Colección completa de Versal API con todos los endpoints",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    version: "1.0.0"
  },
  variable: [
    { key: "base_url", value: "http://localhost:3000/api", type: "string" },
    { key: "token", value: "", type: "string" }
  ],
  item: [
    // Auth
    {
      name: "Auth",
      item: [
        {
          name: "Register",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Test User",
                username: "testuser",
                email: "test@example.com",
                password: "Password123!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/auth/register",
              host: ["{{base_url}}"],
              path: ["auth", "register"]
            }
          }
        },
        {
          name: "Login",
          event: [{
            listen: "test",
            script: {
              exec: [
                "const res = pm.response.json();",
                "if (res.accessToken) {",
                "  pm.collectionVariables.set('token', res.accessToken);",
                "}"
              ],
              type: "text/javascript"
            }
          }],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "test@example.com",
                password: "Password123!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/auth/login",
              host: ["{{base_url}}"],
              path: ["auth", "login"]
            }
          }
        },
        {
          name: "Me (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/auth/me",
              host: ["{{base_url}}"],
              path: ["auth", "me"]
            }
          }
        },
        {
          name: "Refresh Token",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{base_url}}/auth/refresh",
              host: ["{{base_url}}"],
              path: ["auth", "refresh"]
            }
          }
        },
        {
          name: "Logout",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{base_url}}/auth/logout",
              host: ["{{base_url}}"],
              path: ["auth", "logout"]
            }
          }
        },
        {
          name: "Forgot Password",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "test@example.com" }, null, 2)
            },
            url: {
              raw: "{{base_url}}/auth/forgot-password",
              host: ["{{base_url}}"],
              path: ["auth", "forgot-password"]
            }
          }
        },
        {
          name: "Reset Password",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "test@example.com",
                token: "RESET_TOKEN_AQUI",
                newPassword: "NewPassword123!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/auth/reset-password",
              host: ["{{base_url}}"],
              path: ["auth", "reset-password"]
            }
          }
        },
        {
          name: "OAuth Google",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/auth/oauth/google",
              host: ["{{base_url}}"],
              path: ["auth", "oauth", "google"]
            }
          }
        }
      ]
    },
    // Stories
    {
      name: "Stories",
      item: [
        {
          name: "List Stories",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories?page=1&limit=10",
              host: ["{{base_url}}"],
              path: ["stories"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "10" }
              ]
            }
          }
        },
        {
          name: "Get Story",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/:id",
              host: ["{{base_url}}"],
              path: ["stories", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Create Story (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Mi Nueva Historia",
                description: "Una historia increíble",
                categoryId: 1,
                tagIds: [1, 2],
                coverImage: "https://example.com/cover.jpg",
                isPublished: true
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/stories",
              host: ["{{base_url}}"],
              path: ["stories"]
            }
          }
        },
        {
          name: "Update Story (Protected)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Título Actualizado",
                description: "Descripción actualizada"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/stories/:id",
              host: ["{{base_url}}"],
              path: ["stories", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Delete Story (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/stories/:id",
              host: ["{{base_url}}"],
              path: ["stories", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "List Categories",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/categories",
              host: ["{{base_url}}"],
              path: ["stories", "categories"]
            }
          }
        },
        {
          name: "List Tags",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/tags",
              host: ["{{base_url}}"],
              path: ["stories", "tags"]
            }
          }
        },
        {
          name: "Stories by Author (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/stories/author/:authorId",
              host: ["{{base_url}}"],
              path: ["stories", "author", ":authorId"],
              variable: [{ key: "authorId", value: "1" }]
            }
          }
        },
        {
          name: "Stories by Category",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/category/:categoryName",
              host: ["{{base_url}}"],
              path: ["stories", "category", ":categoryName"],
              variable: [{ key: "categoryName", value: "Romance" }]
            }
          }
        },
        {
          name: "Stories by Tag",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/tag/:tagName",
              host: ["{{base_url}}"],
              path: ["stories", "tag", ":tagName"],
              variable: [{ key: "tagName", value: "fantasy" }]
            }
          }
        }
      ]
    },
    // Chapters
    {
      name: "Chapters",
      item: [
        {
          name: "List Chapters",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/:storyId/chapters",
              host: ["{{base_url}}"],
              path: ["stories", ":storyId", "chapters"],
              variable: [{ key: "storyId", value: "1" }]
            }
          }
        },
        {
          name: "Get Chapter",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/chapters/:id",
              host: ["{{base_url}}"],
              path: ["chapters", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Create Chapter (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Capítulo 1",
                content: "Contenido del capítulo...",
                chapterNumber: 1,
                isPublished: true
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/stories/:storyId/chapters",
              host: ["{{base_url}}"],
              path: ["stories", ":storyId", "chapters"],
              variable: [{ key: "storyId", value: "1" }]
            }
          }
        },
        {
          name: "Update Chapter (Protected)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Capítulo 1 - Actualizado",
                content: "Contenido actualizado..."
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/chapters/:id",
              host: ["{{base_url}}"],
              path: ["chapters", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Delete Chapter (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/chapters/:id",
              host: ["{{base_url}}"],
              path: ["chapters", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Upload Chapter Image (Protected)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "image", type: "file", src: "" }
              ]
            },
            url: {
              raw: "{{base_url}}/chapters/:id/upload-image",
              host: ["{{base_url}}"],
              path: ["chapters", ":id", "upload-image"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Published Chapters Count",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/stories/:storyId/published-chapters-count",
              host: ["{{base_url}}"],
              path: ["stories", ":storyId", "published-chapters-count"],
              variable: [{ key: "storyId", value: "1" }]
            }
          }
        }
      ]
    },
    // Users
    {
      name: "Users",
      item: [
        {
          name: "Get Followers",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/users/:id/followers",
              host: ["{{base_url}}"],
              path: ["users", ":id", "followers"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Get Following",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/users/:id/following",
              host: ["{{base_url}}"],
              path: ["users", ":id", "following"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Follow User (Protected)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/users/:id/follow",
              host: ["{{base_url}}"],
              path: ["users", ":id", "follow"],
              variable: [{ key: "id", value: "2" }]
            }
          }
        },
        {
          name: "Unfollow User (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/users/:id/unfollow",
              host: ["{{base_url}}"],
              path: ["users", ":id", "unfollow"],
              variable: [{ key: "id", value: "2" }]
            }
          }
        },
        {
          name: "Block User (Protected)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/users/:id/block",
              host: ["{{base_url}}"],
              path: ["users", ":id", "block"],
              variable: [{ key: "id", value: "2" }]
            }
          }
        },
        {
          name: "Unblock User (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/users/:id/unblock",
              host: ["{{base_url}}"],
              path: ["users", ":id", "unblock"],
              variable: [{ key: "id", value: "2" }]
            }
          }
        },
        {
          name: "Update Profile (Protected)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Updated Name",
                bio: "Mi nueva biografía"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/users/profile",
              host: ["{{base_url}}"],
              path: ["users", "profile"]
            }
          }
        },
        {
          name: "Change Password (Protected)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                currentPassword: "Password123!",
                newPassword: "NewPassword123!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/users/password",
              host: ["{{base_url}}"],
              path: ["users", "password"]
            }
          }
        }
      ]
    },
    // Favorites
    {
      name: "Favorites",
      item: [
        {
          name: "My Favorites (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/favorites/me/favorites",
              host: ["{{base_url}}"],
              path: ["favorites", "me", "favorites"]
            }
          }
        },
        {
          name: "Toggle Favorite (Protected)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/favorites/stories/:storyId/favorite",
              host: ["{{base_url}}"],
              path: ["favorites", "stories", ":storyId", "favorite"],
              variable: [{ key: "storyId", value: "1" }]
            }
          }
        },
        {
          name: "Is Favorite (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/favorites/stories/:storyId/isFavorite",
              host: ["{{base_url}}"],
              path: ["favorites", "stories", ":storyId", "isFavorite"],
              variable: [{ key: "storyId", value: "1" }]
            }
          }
        }
      ]
    },
    // Interactions
    {
      name: "Interactions",
      item: [
        {
          name: "Get Chapter Interactions",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/chapters/:id/interactions",
              host: ["{{base_url}}"],
              path: ["chapters", ":id", "interactions"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Like Chapter (Protected)",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/chapters/:id/like",
              host: ["{{base_url}}"],
              path: ["chapters", ":id", "like"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Unlike Chapter (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/chapters/:id/unlike",
              host: ["{{base_url}}"],
              path: ["chapters", ":id", "unlike"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Add Comment (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                content: "¡Excelente capítulo!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/chapters/:id/comments",
              host: ["{{base_url}}"],
              path: ["chapters", ":id", "comments"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        },
        {
          name: "Delete Comment (Protected)",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/comments/:id",
              host: ["{{base_url}}"],
              path: ["comments", ":id"],
              variable: [{ key: "id", value: "1" }]
            }
          }
        }
      ]
    },
    // Reports
    {
      name: "Reports",
      item: [
        {
          name: "Create Report (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reportedEntityType: "STORY",
                reportedEntityId: 1,
                reason: "Contenido inapropiado",
                description: "Esta historia contiene contenido ofensivo"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/reports",
              host: ["{{base_url}}"],
              path: ["reports"]
            }
          }
        },
        {
          name: "List Reports (Admin)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/reports?status=PENDING",
              host: ["{{base_url}}"],
              path: ["reports"],
              query: [{ key: "status", value: "PENDING" }]
            }
          }
        },
        {
          name: "Update Report Status (Admin)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                status: "RESOLVED",
                adminNotes: "Reporte revisado y resuelto"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/reports/:reportId/status",
              host: ["{{base_url}}"],
              path: ["reports", ":reportId", "status"],
              variable: [{ key: "reportId", value: "1" }]
            }
          }
        }
      ]
    },
    // Transactions
    {
      name: "Transactions",
      item: [
        {
          name: "List Subscription Plans",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/products/subscriptions",
              host: ["{{base_url}}"],
              path: ["products", "subscriptions"]
            }
          }
        },
        {
          name: "List Coin Packs",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/products/coin-packs",
              host: ["{{base_url}}"],
              path: ["products", "coin-packs"]
            }
          }
        },
        {
          name: "Checkout Subscription (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                productId: "premium_monthly"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/transactions/checkout/subscription",
              host: ["{{base_url}}"],
              path: ["transactions", "checkout", "subscription"]
            }
          }
        },
        {
          name: "Checkout Coins (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                productId: "coins_100"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/transactions/checkout/coins",
              host: ["{{base_url}}"],
              path: ["transactions", "checkout", "coins"]
            }
          }
        },
        {
          name: "My Transactions (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/transactions/me",
              host: ["{{base_url}}"],
              path: ["transactions", "me"]
            }
          }
        },
        {
          name: "Stripe Webhook",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: "{}"
            },
            url: {
              raw: "{{base_url}}/transactions/stripe-webhook",
              host: ["{{base_url}}"],
              path: ["transactions", "stripe-webhook"]
            }
          }
        }
      ]
    },
    // Donations
    {
      name: "Donations",
      item: [
        {
          name: "Donate (Protected)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                recipientId: 2,
                amount: 100,
                message: "¡Excelente trabajo!"
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/transactions/donate",
              host: ["{{base_url}}"],
              path: ["transactions", "donate"]
            }
          }
        },
        {
          name: "Received Donations (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/donations/received",
              host: ["{{base_url}}"],
              path: ["donations", "received"]
            }
          }
        },
        {
          name: "Sent Donations (Protected)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: {
              raw: "{{base_url}}/donations/sent",
              host: ["{{base_url}}"],
              path: ["donations", "sent"]
            }
          }
        }
      ]
    }
  ]
};

// Write to file
const outputPath = path.join(__dirname, '..', '.postman.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log('✅ Postman collection generated successfully!');
console.log(`📁 File: ${outputPath}`);
