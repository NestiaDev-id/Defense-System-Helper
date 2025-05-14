from ..models.schemas import EncryptRequest, DecryptRequest
from ..utils.security import SecurityUtils

class CryptoService:
    def __init__(self):
        self.salt = b"fixed-salt-for-demo"  # In production, use a secure salt management system
    
    async def encrypt_data(self, request: EncryptRequest) -> dict:
        key = SecurityUtils.generate_key(request.key, self.salt)
        return SecurityUtils.aes_gcm_encrypt(request.data, key)
    
    async def decrypt_data(self, request: DecryptRequest) -> str:
        key = SecurityUtils.generate_key(request.key, self.salt)
        return SecurityUtils.aes_gcm_decrypt(
            request.encrypted,
            request.iv,
            request.tag,
            key
        ) 