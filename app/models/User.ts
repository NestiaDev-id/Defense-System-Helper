export interface User {
  id?: string;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Field tambahan untuk alur kompleks
  encoded_combined_hmac?: string;
  aes_cipherdata_b64?: string;
  argon_salt_b64?: string;
  aes_iv_b64?: string;
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface ComplexPasswordData {
  argon2id_hash: string;
  encoded_combined_hmac: string;
  aes_cipherdata_b64: string;
  argon_salt_b64: string;
  aes_iv_b64: string;
}
