import { Context, Next } from "hono";
import { SecurityService } from "../../services/security.service";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await SecurityService.verifyJWT(token);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
}
