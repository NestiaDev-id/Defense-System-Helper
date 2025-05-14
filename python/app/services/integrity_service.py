from ..models.schemas import SignatureRequest, VerifyRequest
from ..utils.security import SecurityUtils

class IntegrityService:
    def __init__(self):
        self.hmac_key = b"your-hmac-key"  # In production, use a secure key management system
    
    async def create_signature(self, request: SignatureRequest) -> dict:
        signature = SecurityUtils.create_signature(request.data, request.key)
        return {"signature": signature}
    
    async def verify_signature(self, request: VerifyRequest) -> dict:
        is_valid = SecurityUtils.verify_signature(
            request.data,
            request.signature,
            self.hmac_key.decode()
        )
        return {"valid": is_valid} 