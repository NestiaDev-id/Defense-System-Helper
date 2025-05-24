import { Context, Next } from "hono";
import { verify } from "hono/jwt"; // Impor JWTPayload dari hono dan beri alias
import { env } from "../../config/env.js"; // Pastikan path ini benar
// Impor AppError sudah dihapus karena tidak digunakan secara langsung di sini
import type { JWTPayload } from "jose"; // ← tipe payload dari JWT

// Definisikan struktur payload JWT yang DIHARAPKAN oleh aplikasi Anda
// Ini harus cocok dengan apa yang Anda masukkan saat membuat token (misalnya di AuthService)
interface AppSpecificJwtPayload extends JWTPayload {
  // Bisa extend HonoJwtPayload jika mau
  userId: string;
  // Tambahkan properti lain yang Anda sertakan dalam token, misalnya:
  // username?: string;
  // roles?: string[];
}

export async function isAuthenticated(
  c: Context,
  next: Next
): Promise<Response | void> {
  // Tipe return eksplisit
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json({ error: "Unauthorized: Token malformed" }, 401);
  }

  try {
    // Verifikasi token menggunakan secret dari env
    const decoded: JWTPayload = await verify(token, env.HONO_SECRET_KEY);

    // Lakukan runtime check untuk properti yang Anda butuhkan, seperti userId
    if (typeof (decoded as AppSpecificJwtPayload).userId !== "string") {
      console.error("JWT payload_userId is missing or not a string:", decoded);
      return c.json(
        {
          error:
            "Unauthorized: Invalid token payload structure (userId missing or invalid)",
        },
        401
      );
    }

    // Setelah divalidasi, Anda bisa melakukan cast dengan lebih aman
    const userPayload = decoded as AppSpecificJwtPayload;

    // Lampirkan payload pengguna ke konteks
    c.set("user", userPayload);
    // Jika Anda hanya ingin userId:
    // c.set('userId', userPayload.userId);
  } catch (error) {
    // Tangani error verifikasi JWT dari hono/jwt
    if (
      error instanceof Error &&
      (error.name === "JwtTokenInvalid" || error.name === "JwtTokenExpired")
    ) {
      return c.json({ error: `Unauthorized: ${error.message}` }, 401);
    }
    // Untuk error lain yang tidak terduga selama proses verifikasi
    console.error("JWT verification processing error:", error);
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }

  return await next(); // Panggil dan return next() secara eksplisit
}
