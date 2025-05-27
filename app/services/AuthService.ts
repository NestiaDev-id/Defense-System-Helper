import { ComplexPasswordData, User } from "../models/User.js";
import { UserRepository } from "../repositories/UserRepository.js";
import {
  AuthenticationError,
  ValidationError,
} from "../exceptions/AppError.js";
import { SecurityUtils } from "../utils/SecurityUtils.js";
import { SecurityService } from "./security.service.js";
import { PythonService } from "./PythonService.js";
import {
  PythonAesDecryptResponse,
  PythonVerifyPasswordResponse,
} from "../http/interfaces/auth.interface.js";

export class AuthService {
  static async register(
    username: string,
    hashedPasswordFromPython: string
  ): Promise<User> {
    // Terima hashedPassword
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    return UserRepository.create({
      username,
      password: hashedPasswordFromPython, // Simpan hash yang sudah dibuat Python
    });
  }

  static async login(username: string, password: string): Promise<string> {
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new AuthenticationError("Invalid credentials"); // Ganti dengan AuthenticationError jika ada
    }

    // Verifikasi password bisa tetap memanggil Python jika Anda mau
    // atau lakukan di Node.js jika library bcrypt/argon2 ada di Node.js
    const isValid = await SecurityService.verifyPassword(
      password,
      user.password
    ); // SecurityService.ts
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const token = await SecurityUtils.generateJWT({
      userId: user.id!,
      username: user.username,
    }); // SecurityUtils.ts

    // await UserRepository.createSession({
    //   userId: user.id!,
    //   token,
    //   expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    // });
    return token;
  }

  static async validateToken(token: string): Promise<User> {
    const session = await UserRepository.findSessionByToken(token);
    if (!session || session.expiresAt < new Date()) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await UserRepository.findByUsername(session.userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    return user;
  }

  static async registerComplex(
    username: string,
    passwordData: ComplexPasswordData // Menerima objek dengan semua data terenkripsi/hash
  ): Promise<User> {
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    // Panggil metode UserRepository yang sesuai
    return UserRepository.createComplexUser(username, passwordData);
  }
  static async findUserByUsername(username: string) {
    return UserRepository.findByUsername(username);
  }

  static async loginComplex(
    username: string,
    passwordLoginAttempt: string
  ): Promise<string> {
    const user = await UserRepository.findByUsername(username); // Mengambil semua data pengguna

    if (
      !user ||
      !user.password ||
      !user.argon_salt_b64 ||
      !user.aes_cipherdata_b64 ||
      !user.aes_iv_b64 ||
      !user.encoded_combined_hmac
    ) {
      console.warn(
        `Data pengguna tidak lengkap untuk login kompleks: ${username}`
      );
      throw new AuthenticationError(
        "Invalid credentials or incomplete user data."
      );
    }

    const argon2id_hash_stored = user.password; // Ini adalah hash Argon2id
    const argon_salt_b64_stored = user.argon_salt_b64;
    const aes_cipherdata_b64_stored = user.aes_cipherdata_b64;
    const aes_iv_b64_stored = user.aes_iv_b64;
    const encoded_combined_hmac_stored = user.encoded_combined_hmac;

    // Langkah 3: Verifikasi Argon2id Hash via Python
    // Asumsi endpoint /auth/verify-password sudah menggunakan Argon2id dan menerima password + hash
    const argon2idVerificationResult =
      await PythonService.callPythonApi<PythonVerifyPasswordResponse>(
        "/auth/verify-password", // Atau endpoint spesifik /auth/argon2id-verify
        "POST",
        { password: passwordLoginAttempt, hash: argon2id_hash_stored }
        // Jika Python memerlukan salt terpisah untuk verifikasi Argon2id (jarang untuk verify), kirim juga
      );

    if (!argon2idVerificationResult.valid) {
      throw new AuthenticationError("Invalid credentials (Argon2id mismatch).");
    }
    console.log(`[AuthService] Argon2id hash for ${username} is valid.`);

    // Langkah 4: Decode Combined Hash (HMAC)
    let combined_hmac_decoded_hex: string; // Asumsi HMAC dari Python adalah hex sebelum di-encode Base64 oleh Hono
    try {
      combined_hmac_decoded_hex = Buffer.from(
        encoded_combined_hmac_stored,
        "base64"
      ).toString("hex");
    } catch (e) {
      console.error("Failed to decode combined_hmac_stored from base64", e);
      throw new AuthenticationError("Stored HMAC data corrupted.");
    }

    // Langkah 5: Dekripsi Kata Sandi (AES Cipherdata) via Python
    const aesDecryptionResult =
      await PythonService.callPythonApi<PythonAesDecryptResponse>(
        "/data/aes-decrypt-password", // Buat endpoint ini di Python
        "POST",
        {
          cipherdata_b64: aes_cipherdata_b64_stored,
          salt_for_kdf: Buffer.from(argon_salt_b64_stored, "base64").toString(
            "hex"
          ), // Kirim salt KDF (jika Python butuh hex)
          iv_b64: aes_iv_b64_stored,
          // Kunci AES akan diturunkan Python dari passwordLoginAttempt dan salt_for_kdf
          password_for_kdf: passwordLoginAttempt, // Python akan menggunakan ini dan salt_for_kdf untuk derive key
        }
      );
    const decrypted_original_password = aesDecryptionResult.decrypted_data;
    console.log(`[AuthService] AES decryption for ${username} successful.`);

    // Langkah 6: Perbandingan Plaintext (Opsional tapi sangat direkomendasikan)
    if (decrypted_original_password !== passwordLoginAttempt) {
      // Ini adalah kondisi yang sangat tidak biasa jika semua langkah sebelumnya benar.
      // Bisa mengindikasikan manipulasi data atau masalah fundamental.
      console.error(
        `[AuthService] CRITICAL: Decrypted password does not match login attempt for ${username}.`
      );
      throw new AuthenticationError("Password data integrity issue.");
    }
    console.log(
      `[AuthService] Decrypted password matches login attempt for ${username}.`
    );

    // Langkah 7: Verifikasi Combined Hash (HMAC) via Python
    const hmacVerificationResult =
      await PythonService.callPythonApi<PythonVerifyHmacResponse>(
        "/integrity/verify-hmac", // Buat endpoint ini di Python
        "POST",
        {
          data_to_verify_b64: aes_cipherdata_b64_stored, // Data asli yang di-HMAC saat registrasi
          hmac_key_material: argon2id_hash_stored, // Kunci HMAC yang digunakan saat registrasi
          received_hmac_hex: combined_hmac_decoded_hex, // HMAC yang disimpan dan sudah di-decode
        }
      );

    if (!hmacVerificationResult.valid) {
      throw new AuthenticationError(
        "Invalid credentials (HMAC mismatch - data integrity failed)."
      );
    }
    console.log(`[AuthService] HMAC verification for ${username} successful.`);

    // Langkah 8: Otentikasi Berhasil, buat token JWT
    const tokenPayload = {
      userId: user.id!,
      username: user.username,
    };
    const token = await SecurityUtils.generateJWT(tokenPayload);

    // (Opsional: logika sesi stateful)

    return token;
  }
}
