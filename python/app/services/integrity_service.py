import hmac
import hashlib
import base64
from ..models.schemas import SignRequest, VerifyRequest
from ..models.schemas import GenerateHmacRequest, GenerateHmacResponse


class IntegrityService:
    def __init__(self):
        self.hmac_key = (
            b"your-hmac-key"  # In production, use a secure key management system
        )

    async def create_signature(self, request: SignRequest) -> dict:
        try:
            key_bytes = request.key.encode()
            data_bytes = request.data.encode()
            signature = hmac.new(key_bytes, data_bytes, hashlib.sha256).digest()
            return {"signature": base64.b64encode(signature).decode("utf-8")}
        except Exception as e:
            raise ValueError(f"Failed to create signature: {str(e)}")

    async def verify_signature(self, request: VerifyRequest) -> dict:
        try:
            signature = base64.b64decode(request.signature)
            key_bytes = request.key.encode()
            data_bytes = request.data.encode()
            expected_signature = hmac.new(
                key_bytes, data_bytes, hashlib.sha256
            ).digest()
            valid = hmac.compare_digest(signature, expected_signature)
            return {"valid": valid}
        except Exception as e:
            raise ValueError(f"Failed to verify signature: {str(e)}")

    async def generate_combined_hmac(
        self, request: GenerateHmacRequest
    ) -> GenerateHmacResponse:
        try:
            data_to_hmac_bytes = base64.b64decode(request.data_to_hmac_b64)
            # hmac_key_material (misalnya, hash Argon2id) mungkin perlu di-encode ke bytes jika masih string
            # atau jika sudah berupa hex string, diubah ke bytes.
            # Untuk HMAC, kuncinya adalah bytes. Jika $hashed_password dari Argon2id adalah string,
            # kita perlu menentukannya. Argon2 library biasanya mengembalikan string yang berisi salt,
            # parameter, dan hash itu sendiri. Kita mungkin hanya ingin menggunakan bagian hash murni
            # atau seluruh string sebagai input untuk kunci HMAC (setelah di-encode ke bytes).
            # Mari asumsikan hmac_key_material adalah string yang bisa langsung di-encode.
            hmac_key_bytes = request.hmac_key_material.encode("utf-8")

            # Menggunakan SHA-256 untuk HMAC sesuai deskripsi Anda
            hmac_digest = hmac.new(
                hmac_key_bytes, data_to_hmac_bytes, hashlib.sha256
            ).hexdigest()

            return GenerateHmacResponse(combined_hash_hex=hmac_digest)
        except Exception as e:
            raise ValueError(f"Failed to generate combined HMAC: {str(e)}")
