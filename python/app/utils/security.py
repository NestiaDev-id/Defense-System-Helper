from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
import hmac
import hashlib

class SecurityUtils:
    @staticmethod
    def generate_key(password: str, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(password.encode())

    @staticmethod
    def aes_gcm_encrypt(data: str, key: bytes) -> dict:
        aesgcm = AESGCM(key)
        iv = os.urandom(12)
        encrypted = aesgcm.encrypt(iv, data.encode(), None)
        return {
            "encrypted": base64.b64encode(encrypted[:-16]).decode(),
            "tag": base64.b64encode(encrypted[-16:]).decode(),
            "iv": base64.b64encode(iv).decode()
        }

    @staticmethod
    def aes_gcm_decrypt(encrypted: str, iv: str, tag: str, key: bytes) -> str:
        aesgcm = AESGCM(key)
        encrypted_bytes = base64.b64decode(encrypted)
        iv_bytes = base64.b64decode(iv)
        tag_bytes = base64.b64decode(tag)
        decrypted = aesgcm.decrypt(iv_bytes, encrypted_bytes + tag_bytes, None)
        return decrypted.decode()

    @staticmethod
    def create_signature(data: str, key: str) -> str:
        return hmac.new(
            key.encode(),
            data.encode(),
            hashlib.sha512
        ).hexdigest()

    @staticmethod
    def verify_signature(data: str, signature: str, key: str) -> bool:
        expected = hmac.new(
            key.encode(),
            data.encode(),
            hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(signature, expected) 