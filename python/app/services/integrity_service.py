import hmac
import hashlib
import base64
from ..models.schemas import SignRequest, VerifyRequest

class IntegrityService:
    def __init__(self):
        self.hmac_key = b"your-hmac-key"  # In production, use a secure key management system
    
    async def create_signature(self, request: SignRequest) -> dict:
        try:
            key_bytes = request.key.encode()
            data_bytes = request.data.encode()
            signature = hmac.new(key_bytes, data_bytes, hashlib.sha256).digest()
            return {"signature": base64.b64encode(signature).decode('utf-8')}
        except Exception as e:
            raise ValueError(f"Failed to create signature: {str(e)}")
    
    async def verify_signature(self, request: VerifyRequest) -> dict:
        try:
            signature = base64.b64decode(request.signature)
            key_bytes = request.key.encode()
            data_bytes = request.data.encode()
            expected_signature = hmac.new(key_bytes, data_bytes, hashlib.sha256).digest()
            valid = hmac.compare_digest(signature, expected_signature)
            return {"valid": valid}
        except Exception as e:
            raise ValueError(f"Failed to verify signature: {str(e)}") 