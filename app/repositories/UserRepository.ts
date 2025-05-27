import { ComplexPasswordData, User, UserSession } from "../models/User.js";

export class UserRepository {
  private static users: Map<string, User> = new Map();
  private static sessions: Map<string, UserSession> = new Map();

  static async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  static async create(user: User): Promise<User> {
    const id = Math.random().toString(36).substring(7);
    const newUser = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  static async createSession(session: UserSession): Promise<void> {
    this.sessions.set(session.token, session);
  }

  static async findSessionByToken(token: string): Promise<UserSession | null> {
    return this.sessions.get(token) || null;
  }

  // Fungsi untuk membuat user dengan data password kompleks dengan Argon2id dan AES
  static async createComplexUser(
    username: string,
    complexData: ComplexPasswordData
  ): Promise<User> {
    const id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15); // ID yang lebih unik

    const newUser: User = {
      id,
      username,
      password: complexData.argon2id_hash, // Simpan hash Argon2id sebagai password utama
      encoded_combined_hmac: complexData.encoded_combined_hmac,
      aes_cipherdata_b64: complexData.aes_cipherdata_b64,
      argon_salt_b64: complexData.argon_salt_b64,
      aes_iv_b64: complexData.aes_iv_b64,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    console.log("[UserRepository] User created:", newUser.username, newUser.id);
    return newUser;
  }
}
