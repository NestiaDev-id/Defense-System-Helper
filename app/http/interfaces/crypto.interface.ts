export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptRequest {
  data: string;
  publicKey?: string; // For hybrid encryption
}

export interface EncryptResponse {
  encrypted: string;
  iv: string;
  tag: string;
  encapsulatedKey?: string; // For hybrid encryption
}

export interface DecryptRequest {
  encrypted: string;
  iv: string;
  tag: string;
  privateKey?: string; // For hybrid encryption
  encapsulatedKey?: string; // For hybrid encryption
}

export interface DecryptResponse {
  decrypted: string;
}

export interface SignRequest {
  message: string;
  privateKey: string;
}

export interface SignResponse {
  signature: string;
}

export interface VerifySignRequest {
  message: string;
  signature: string;
  publicKey: string;
}

export interface VerifySignResponse {
  valid: boolean;
}

export interface IntegrityCheckRequest {
  original: string;
  hmac: string;
}

export interface IntegrityCheckResponse {
  valid: boolean;
}
