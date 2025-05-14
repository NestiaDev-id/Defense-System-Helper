import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { apiReference } from "@scalar/hono-api-reference";
import { AuthController } from "./http/controllers/auth.controller";
import { CryptoController } from "./http/controllers/crypto.controller";
import { authMiddleware } from "./http/middleware/auth.middleware";
import { openApiDoc } from "../config/openapi";

export const app = new Hono();

// Enable CORS and Pretty JSON
app.use("/*", cors());
app.use("/*", prettyJSON());

// Serve OpenAPI documentation
app.get(
  "/",
  apiReference({
    theme: "kepler",
    layout: "classic",
    spec: {
      url: "/openapi.json",
    },
  })
);

app.get("/docs", (c) => c.json(openApiDoc));
app.get("/openapi.json", (c) => c.json(openApiDoc));

// Auth Routes
app.post("/auth/register", AuthController.register);
app.post("/auth/login", AuthController.login);
app.post("/auth/hash-password", AuthController.hashPassword);
app.post("/auth/verify-password", AuthController.verifyPassword);
app.post("/auth/refresh-token", AuthController.refreshToken);

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
app.post("/data/integrity/check", CryptoController.checkIntegrity);

// Start server if this file is run directly
if (require.main === module) {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
      console.log("API Documentation is available at http://localhost:3000");
    }
  );
}
