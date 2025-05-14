export const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Defense System Helper API",
    version: "1.0.0",
    description: "Military-grade security API with quantum-safe encryption",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User registered successfully",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/hash-password": {
      post: {
        tags: ["Authentication"],
        summary: "Hash a password using Argon2id",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", format: "password" },
                },
                required: ["password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password hashed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hash: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/verify-password": {
      post: {
        tags: ["Authentication"],
        summary: "Verify password against hash",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  password: { type: "string", format: "password" },
                  hash: { type: "string" },
                },
                required: ["password", "hash"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/encrypt": {
      post: {
        tags: ["Data Security"],
        summary: "Encrypt data using AES-256-GCM",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                },
                required: ["data"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data encrypted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encrypted: { type: "string" },
                    iv: { type: "string" },
                    tag: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/decrypt": {
      post: {
        tags: ["Data Security"],
        summary: "Decrypt data using AES-256-GCM",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encrypted: { type: "string" },
                  iv: { type: "string" },
                  tag: { type: "string" },
                },
                required: ["encrypted", "iv", "tag"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Data decrypted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    decrypted: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/crypto/key/kem": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Generate Kyber KEM key pair",
        responses: {
          "200": {
            description: "Kyber key pair generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    publicKey: { type: "string" },
                    privateKey: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/crypto/key/sign": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Generate Dilithium signature key pair",
        responses: {
          "200": {
            description: "Dilithium key pair generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    publicKey: { type: "string" },
                    privateKey: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/hybrid/encrypt": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Encrypt data using Kyber + AES hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  publicKey: { type: "string" },
                },
                required: ["data", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Hybrid encryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    encrypted: { type: "string" },
                    encapsulatedKey: { type: "string" },
                    iv: { type: "string" },
                    tag: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/hybrid/decrypt": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Decrypt data using Kyber + AES hybrid scheme",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  encrypted: { type: "string" },
                  encapsulatedKey: { type: "string" },
                  iv: { type: "string" },
                  tag: { type: "string" },
                  privateKey: { type: "string" },
                },
                required: [
                  "encrypted",
                  "encapsulatedKey",
                  "iv",
                  "tag",
                  "privateKey",
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Hybrid decryption success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    decrypted: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/sign": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Sign data using Dilithium",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  privateKey: { type: "string" },
                },
                required: ["message", "privateKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signature created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    signature: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/verify-sign": {
      post: {
        tags: ["Post-Quantum"],
        summary: "Verify Dilithium signature",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  signature: { type: "string" },
                  publicKey: { type: "string" },
                },
                required: ["message", "signature", "publicKey"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/data/integrity/check": {
      post: {
        tags: ["Integrity"],
        summary: "Verify data integrity using HMAC",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  hmac: { type: "string" },
                },
                required: ["original", "hmac"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "HMAC verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
