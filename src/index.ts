import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { SecurityUtils } from "./utils/security";
import { prettyJSON } from "hono/pretty-json";
import { apiReference } from "@scalar/hono-api-reference";

const app = new Hono();

// Enable CORS and Pretty JSON
app.use("/*", cors());
app.use("/*", prettyJSON());

// OpenAPI Documentation
const openApiDoc = {
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
    // ... existing API documentation ...
  },
};

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

app.get("/docs", (c) => {
  return c.json(openApiDoc);
});

app.get("/openapi.json", (c) => {
  return c.json(openApiDoc);
});

// Auth Routes
app.post("/auth/register", async (c) => {
  const { username, password } = await c.req.json();
  const hashedPassword = await SecurityUtils.hashPassword(password);

  // Forward to Python service
  const response = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: hashedPassword }),
  });

  return c.json(await response.json());
});

app.post("/auth/login", async (c) => {
  const { username, password } = await c.req.json();

  // Forward to Python service
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const token = await SecurityUtils.generateJWT(
      { username },
      "your-secret-key"
    );
    return c.json({ token });
  }

  return c.json({ error: "Invalid credentials" }, 401);
});

// Protected Routes
app.post("/data/encrypt", async (c) => {
  const { data } = await c.req.json();

  // Forward to Python service
  const response = await fetch("http://localhost:8000/data/encrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, key: "your-encryption-key" }),
  });

  return c.json(await response.json());
});

app.post("/data/decrypt", async (c) => {
  const { encrypted, iv, tag } = await c.req.json();

  // Forward to Python service
  const response = await fetch("http://localhost:8000/data/decrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      encrypted,
      iv,
      tag,
      key: "your-encryption-key",
    }),
  });

  return c.json(await response.json());
});

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
