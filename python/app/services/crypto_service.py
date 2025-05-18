import os
import secrets
import hashlib
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from ..models.schemas import EncryptRequest, DecryptRequest

class CryptoService:
    def __init__(self):
        self.salt = os.urandom(16)  # Generate a random salt for each instance
    
    def derive_key(self, key: str, salt: bytes = None) -> tuple[bytes, bytes]:
        if salt is None:
            salt = self.salt
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        derived_key = kdf.derive(key.encode())
        return derived_key, salt

    async def generate_kem_key_pair(self) -> dict:
        # For demo purposes, we'll generate a simple key pair
        # In production, use proper KEM algorithms
        private_key = secrets.token_urlsafe(32)
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        return {
            "publicKey": public_key,
            "privateKey": private_key
        }

    async def generate_sign_key_pair(self) -> dict:
        # For demo purposes, we'll generate a simple key pair
        # In production, use proper signing key algorithms
        private_key = secrets.token_urlsafe(32)
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        return {
            "publicKey": public_key,
            "privateKey": private_key
        }

    async def encrypt_data(self, request: EncryptRequest) -> dict:
        try:
            iv = os.urandom(12)
            key_bytes, _ = self.derive_key(request.key)
            aesgcm = AESGCM(key_bytes)
            data_bytes = request.data.encode()
            ct = aesgcm.encrypt(iv, data_bytes, None)
            ciphertext, tag = ct[:-16], ct[-16:]
            return {
                "encrypted": base64.b64encode(ciphertext).decode('utf-8'),
                "iv": base64.b64encode(iv).decode('utf-8'),
                "tag": base64.b64encode(tag).decode('utf-8')
            }
        except Exception as e:
            raise ValueError(f"Failed to encrypt data: {str(e)}")

    async def decrypt_data(self, request: DecryptRequest) -> dict:
        try:
            ciphertext = base64.b64decode(request.encrypted)
            iv = base64.b64decode(request.iv)
            tag = base64.b64decode(request.tag)
            key_bytes, _ = self.derive_key(request.key)
            aesgcm = AESGCM(key_bytes)
            ct_with_tag = ciphertext + tag
            decrypted = aesgcm.decrypt(iv, ct_with_tag, None)
            return {"decrypted": decrypted.decode('utf-8')}
        except Exception as e:
            raise ValueError(f"Failed to decrypt data: {str(e)}")

    async def hybrid_encrypt(self, request: EncryptRequest) -> dict:
        # For demo purposes, we'll use AES-GCM
        # In production, use proper hybrid encryption
        return await self.encrypt_data(request)

    async def hybrid_decrypt(self, request: DecryptRequest) -> dict:
        # For demo purposes, we'll use AES-GCM
        # In production, use proper hybrid decryption
        return await self.decrypt_data(request) 