import { describe, expect, it } from "@jest/globals";
import { app } from "../../app/app";

describe("Authentication Endpoints", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "testpass123",
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });
  });

  describe("POST /auth/login", () => {
    it("should login a user and return a token", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "testpass123",
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { token: string };
      expect(data.token).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "wrongpass",
        }),
      });

      expect(res.status).toBe(401);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe("Invalid credentials");
    });
  });
});
