import { describe, expect, it } from "@jest/globals";
import { SecurityService } from "../../app/services/security.service";

describe("SecurityService", () => {
  describe("JWT", () => {
    it("should generate and verify JWT tokens", async () => {
      const payload = { username: "testuser" };
      const token = await SecurityService.generateJWT(payload);
      const decoded = await SecurityService.verifyJWT(token);
      expect(decoded.username).toBe(payload.username);
    });
  });

  describe("Encryption", () => {
    it("should encrypt and decrypt data", async () => {
      const data = "test data";
      const key = Buffer.from("0123456789abcdef0123456789abcdef", "hex"); // 32 bytes for AES-256

      const encrypted = await SecurityService.encryptData(data, key);
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.tag).toBeDefined();

      const decrypted = await SecurityService.decryptData(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        key
      );
      expect(decrypted).toBe(data);
    });
  });
});
