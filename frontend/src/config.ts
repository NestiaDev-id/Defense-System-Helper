export const API_URL = 'http://localhost:3000';

export const endpoints = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    hashPassword: `${API_URL}/auth/hash-password`,
    verifyPassword: `${API_URL}/auth/verify-password`,
    refreshToken: `${API_URL}/auth/refresh-token`,
  },
  data: {
    encrypt: `${API_URL}/data/encrypt`,
    decrypt: `${API_URL}/data/decrypt`,
    sign: `${API_URL}/data/sign`,
    verifySign: `${API_URL}/data/verify-sign`,
    checkIntegrity: `${API_URL}/data/integrity/check`,
  },
  crypto: {
    key: {
      kem: `${API_URL}/crypto/key/kem`,
      sign: `${API_URL}/crypto/key/sign`,
    },
    hybrid: {
      encrypt: `${API_URL}/data/hybrid/encrypt`,
      decrypt: `${API_URL}/data/hybrid/decrypt`,
    },
  },
} as const; 