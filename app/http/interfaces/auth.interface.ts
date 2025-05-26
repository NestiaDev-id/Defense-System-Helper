export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {}

export interface TokenResponse {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface HashPasswordRequest {
  password: string;
  timeCost?: number;
  memoryCost?: number;
  parallelism?: number;
}

export interface VerifyPasswordRequest {
  password: string;
  hash: string;
}

export interface VerifyPasswordResponse {
  valid: boolean;
}

// Python responses
export interface PythonRegisterSuccessResponse {
  message: string;
}

// Definisikan tipe respons yang diharapkan dari Python untuk setiap endpoint
export interface PythonMessageResponse {
  // Umumnya untuk register, dll.
  message: string;
  [key: string]: any;
}

export interface PythonErrorResponse {
  detail: string | { msg: string; type: string }[] | any;
}

export interface PythonLoginSuccessResponse {
  message: string;
  username: string;
}

export interface PythonHashPasswordResponse {
  hash: string;
}

export interface PythonVerifyPasswordResponse {
  valid: boolean;
}

export interface PythonRefreshTokenSuccessResponse {
  access_token: string;
}

export interface PythonArgon2idResponse {
  hashed_password: string;
  salt_argon: string; // Salt yang digunakan Argon2id, dalam format hex/base64
}

export interface PythonAesEncryptResponse {
  cipherdata: string; // Base64 encoded ciphertext
}

export interface PythonHmacResponse {
  combined_hash: string; // Hex atau Base64 encoded HMAC
}

export interface PythonAesEncryptPasswordResponse {
  encrypted_password: string; // Base64 encoded encrypted password
  iv_b64: string; // Base64 encoded IV
  salt_for_kdf: string; // Base64 encoded salt for KDF
}

export interface Argon2idHashRequest {
  password: string;
  // tambahkan opsi lain jika ada, seperti salt, timeCost, dll.
}

export interface PythonArgon2idHashResponse {
  // Sesuaikan dengan respons aktual Python
  hashed_password: string;
  salt_argon_hex: string; // atau format lain salt yang dikembalikan Python
}

// Tambahkan juga tipe untuk PythonErrorResponse jika belum ada secara global
export interface PythonErrorResponse {
  detail: string | any;
}
