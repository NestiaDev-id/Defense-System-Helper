import { Hono } from "hono";
import { apiReference } from "@scalar/hono-api-reference";
import { AuthController } from "./http/controllers/auth.controller.js";
import { CryptoController } from "./http/controllers/crypto.controller.js";
import { authMiddleware } from "./http/middleware/auth.middleware.js";
import { openApiDoc } from "../config/openapi.js";

export const app = new Hono();

// Enable CORS and Pretty JSON
// app.use("/*", cors());
// app.use("/*", prettyJSON());

// app.use("*", async (c, next) => {
//   console.log(`[Request] ${c.req.method} ${c.req.url}`);
//   await next();
// });

// Serve OpenAPI documentation
app.get(
  "/",
  apiReference({
    theme: "default",
    layout: "classic",
    spec: {
      url: "/openapi.json",
    },
  })
);

app.get("/docs", (c) => c.json(openApiDoc));
app.get("/openapi.json", (c) => c.json(openApiDoc)); // Add this

// Auth Routes
app.post("/auth/register", AuthController.register);
app.post("/auth/login", AuthController.login);
app.post("/auth/hash-password", AuthController.hashPassword);
app.post("/auth/verify-password", AuthController.verifyPassword);
app.post("/auth/refresh-token", AuthController.refreshToken);
app.post("/auth/argon2id-hash", AuthController.argon2idHash); // New route for Argon2id hashing
// app.post("/auth/argon2id-verify", AuthController.argon2idVerify); // New route for Argon2id verification

// Protected Routes
app.post("/data/encrypt", authMiddleware, CryptoController.encrypt);
app.post("/data/decrypt", authMiddleware, CryptoController.decrypt);

// Crypto Routes
app.post("/crypto/key/kem", CryptoController.generateKemKeyPair);
app.post("/crypto/key/sign", CryptoController.generateSignKeyPair);
app.post("/data/hybrid/encrypt", CryptoController.hybridEncrypt);
app.post("/data/hybrid/decrypt", CryptoController.hybridDecrypt);
app.post("/data/sign", CryptoController.sign);
app.post("/data/verify-sign", CryptoController.verifySign);
app.post("/data/integrity/generate-hmac", CryptoController.generateHmac); // Generate HMAC for data integrity
app.post("/data/integrity/check", CryptoController.checkIntegrity);

app.post("/data/aes-encrypt-password", CryptoController.aesEncryptPassword); // AES encryption with password
// app.post("/data/aes-decrypt-password", CryptoController.aesDecryptPassword); // AES decryption with password
