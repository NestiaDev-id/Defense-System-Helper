import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { SecurityUtils } from "./utils/security";
import { prettyJSON } from "hono/pretty-json";
import { swaggerUI } from '@hono/swagger-ui'

// Define types for our requests and responses
type AuthRequest = {
  username: string;
  password: string;
};

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

type LoginResponse = {
  success: boolean;
  token: string;
};

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
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3002",
      description: "API Server",
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
        summary: "Login user",
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
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },
  },
};

// Serve OpenAPI documentation
app.get('/', (c) => c.redirect('/docs'));
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
app.get('/openapi.json', (c) => c.json(openApiDoc));

// Auth Routes
app.post("/auth/register", async (c) => {
  try {
    const { username } = await c.req.json<AuthRequest>();
    const response: ApiResponse<{ username: string }> = {
      success: true,
      message: "Registration successful",
      data: { username }
    };
    return c.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Error in registration"
    };
    return c.json(response, 400);
  }
});

app.post("/auth/login", async (c) => {
  try {
    const { username } = await c.req.json<AuthRequest>();
    const token = await SecurityUtils.generateJWT(
      { username },
      process.env.JWT_SECRET || "your-secret-key"
    );
    const response: LoginResponse = {
      success: true,
      token
    };
    return c.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Invalid credentials"
    };
    return c.json(response, 401);
  }
});

// Start the server
serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log("API Documentation is available at /docs");
  }
);
