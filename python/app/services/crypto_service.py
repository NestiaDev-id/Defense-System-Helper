import os
import secrets
import hashlib
import base64
import pqcrypto

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from ..models.schemas import EncryptRequest, DecryptRequest
from ..models.schemas import AesEncryptPasswordRequest, AesEncryptPasswordResponse

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import (
    Cipher,
    algorithms,
    modes,
)
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding


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
        public_key, private_key = kyber_kem.generate_keypair()

        # private_key = secrets.token_urlsafe(32)
        # public_key = hashlib.sha256(private_key.encode()).hexdigest()
        return {"publicKey": public_key, "privateKey": private_key}

    async def generate_sign_key_pair(self) -> dict:
        # For demo purposes, we'll generate a simple key pair
        # In production, use proper signing key algorithms
        private_key = secrets.token_urlsafe(32)
        public_key = hashlib.sha256(private_key.encode()).hexdigest()
        return {"publicKey": public_key, "privateKey": private_key}

    async def encrypt_data(self, request: EncryptRequest) -> dict:
        try:
            iv = os.urandom(
                12
            )  # IV 12 byte (96 bit) adalah standar yang baik untuk GCM
            key_bytes, _ = self.derive_key(request.key)  # Mendapatkan kunci 256-bit

            # Periksa panjang kunci setelah derivasi
            if len(key_bytes) != 32:
                raise ValueError("Derived key is not 256-bit.")

            aesgcm = AESGCM(key_bytes)  # AESGCM dengan kunci 256-bit
            data_bytes = request.data.encode()
            ct = aesgcm.encrypt(
                iv, data_bytes, None
            )  # 'None' berarti tidak ada Additional Authenticated Data (AAD)

            ciphertext, tag = ct[:-16], ct[-16:]  # Tag GCM adalah 16 byte (128 bit)

            return {
                "encrypted": base64.b64encode(ciphertext).decode("utf-8"),
                "iv": base64.b64encode(iv).decode("utf-8"),
                "tag": base64.b64encode(tag).decode("utf-8"),
            }
        except Exception as e:
            raise ValueError(f"Failed to encrypt data: {str(e)}")

    async def decrypt_data(self, request: DecryptRequest) -> dict:
        try:
            ciphertext = base64.b64decode(request.encrypted)
            iv = base64.b64decode(request.iv)
            tag = base64.b64decode(request.tag)
            key_bytes, _ = self.derive_key(request.key)  # Mendapatkan kunci 256-bit

            # Periksa panjang kunci setelah derivasi
            if len(key_bytes) != 32:
                raise ValueError("Derived key is not 256-bit for decryption.")

            aesgcm = AESGCM(key_bytes)  # AESGCM dengan kunci 256-bit
            ct_with_tag = (
                ciphertext + tag
            )  # Gabungkan ciphertext dengan tag untuk dekripsi GCM

            decrypted = aesgcm.decrypt(iv, ct_with_tag, None)  # 'None' untuk AAD
            return {"decrypted": decrypted.decode("utf-8")}
        except Exception as e:
            # Exception bisa terjadi jika tag tidak cocok (gagal autentikasi)
            raise ValueError(f"Failed to decrypt data: {str(e)}")

    async def hybrid_encrypt(
        self, data_to_encrypt: str, kyber_public_key_b64: str
    ) -> dict:
        public_key = base64.b64decode(kyber_public_key_b64)

        # Langkah 1: Enkapsulasi → dapatkan shared_secret & ciphertext (encapsulated key)
        encapsulated_key, shared_secret = kyber_kem.encapsulate(public_key)

        # Langkah 2: Enkripsi simetris pakai AES-GCM
        iv = os.urandom(12)
        aesgcm = AESGCM(shared_secret)
        data_bytes = data_to_encrypt.encode("utf-8")
        ct_aes = aesgcm.encrypt(iv, data_bytes, None)
        ciphertext_aes, tag = ct_aes[:-16], ct_aes[-16:]

        return {
            "encrypted_data": base64.b64encode(ciphertext_aes).decode(),
            "iv": base64.b64encode(iv).decode(),
            "tag": base64.b64encode(tag).decode(),
            "encapsulated_key": base64.b64encode(encapsulated_key).decode(),
        }

    async def hybrid_decrypt(
        self,
        encrypted_data_b64: str,
        iv_b64: str,
        tag_b64: str,
        encapsulated_key_b64: str,
        kyber_private_key_b64: str,
    ) -> dict:
        private_key = base64.b64decode(kyber_private_key_b64)
        encapsulated_key = base64.b64decode(encapsulated_key_b64)

        # Dapatkan kembali shared secret yang sama
        shared_secret = kyber_kem.decapsulate(encapsulated_key, private_key)

        # Dekripsi dengan AES-GCM
        ciphertext_aes = base64.b64decode(encrypted_data_b64)
        iv = base64.b64decode(iv_b64)
        tag = base64.b64decode(tag_b64)

        aesgcm = AESGCM(shared_secret)
        ct_with_tag = ciphertext_aes + tag
        decrypted_bytes = aesgcm.decrypt(iv, ct_with_tag, None)

        return {"decrypted_data": decrypted_bytes.decode("utf-8")}

    def _derive_aes_key_from_password_and_salt(
        self, password: str, salt_hex: str
    ) -> bytes:
        """
        Menurunkan kunci AES 256-bit dari password dan salt yang diberikan.
        Salt diharapkan dalam format hex.
        """
        try:
            salt_bytes = base64.b64decode(salt_hex)
            # Jika salt_for_kdf dari Hono adalah base64
            # ATAU jika salt_for_kdf dari Hono adalah hex:
            # salt_bytes = bytes.fromhex(salt_hex)
        except Exception as e:
            raise ValueError(
                f"Invalid salt_for_kdf format. Must be hex or base64 decodable: {e}"
            )

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256-bit key
            salt=salt_bytes,
            iterations=390000,  # Sesuaikan iterasi, standar NIST >10,000. OWASP >310,000 untuk PBKDF2-SHA256
        )
        return kdf.derive(password.encode("utf-8"))

    async def aes_encrypt_password_gcm(
        self, request: AesEncryptPasswordRequest
    ) -> AesEncryptPasswordResponse:
        try:
            password_to_encrypt = request.password
            salt_for_kdf_str = (
                request.salt_for_kdf
            )  # Asumsi ini adalah salt dari Argon2id (hex/base64)
            iv_b64 = request.iv_b64

            aes_key = self._derive_aes_key_from_password_and_salt(
                password_to_encrypt, salt_for_kdf_str
            )

            try:
                iv_bytes = base64.b64decode(iv_b64)
            except Exception as e:
                raise ValueError(f"Invalid iv_b64 format: {e}")

            if len(iv_bytes) != 12:  # Rekomendasi GCM
                raise ValueError("IV must be 12 bytes for AES-GCM.")

            aesgcm = AESGCM(aes_key)
            data_to_encrypt_bytes = password_to_encrypt.encode(
                "utf-8"
            )  # Enkripsi password asli

            encrypted_blob = aesgcm.encrypt(
                iv_bytes, data_to_encrypt_bytes, None
            )  # Tidak ada AAD

            # AESGCM encrypt menghasilkan ciphertext + tag
            # ciphertext_aes = encrypted_blob[:-16] # Tidak perlu dipisah jika ingin disimpan sbg blob
            # tag_aes = encrypted_blob[-16:]

            return AesEncryptPasswordResponse(
                cipherdata_b64=base64.b64encode(encrypted_blob).decode("utf-8")
            )
        except ValueError as ve:
            raise ve  # Lemparkan kembali ValueError spesifik
        except Exception as e:
            # Log error yang lebih detail di sini jika perlu
            raise ValueError(f"Failed to AES encrypt password: {str(e)}")

    # Jika Anda benar-benar HARUS menggunakan AES-CBC seperti deskripsi awal Anda (kurang direkomendasikan dari GCM):
    async def aes_encrypt_password_cbc(
        self, request: AesEncryptPasswordRequest
    ) -> AesEncryptPasswordResponse:
        try:
            password_to_encrypt = request.password
            salt_for_kdf_str = request.salt_for_kdf
            iv_b64 = request.iv_b64

            aes_key = self._derive_aes_key_from_password_and_salt(
                password_to_encrypt, salt_for_kdf_str
            )

            try:
                iv_bytes = base64.b64decode(iv_b64)
            except Exception as e:
                raise ValueError(f"Invalid iv_b64 format: {e}")

            if len(iv_bytes) != 16:  # IV untuk CBC biasanya 16 byte (ukuran blok AES)
                raise ValueError("IV must be 16 bytes for AES-CBC.")

            cipher = Cipher(
                algorithms.AES(aes_key), modes.CBC(iv_bytes), backend=default_backend()
            )
            encryptor = cipher.encryptor()

            # Padding untuk CBC
            padder = padding.PKCS7(algorithms.AES.block_size).padder()
            padded_data = (
                padder.update(password_to_encrypt.encode("utf-8")) + padder.finalize()
            )

            ciphertext_bytes = encryptor.update(padded_data) + encryptor.finalize()

            return AesEncryptPasswordResponse(
                cipherdata_b64=base64.b64encode(ciphertext_bytes).decode("utf-8")
            )
        except Exception as e:
            raise ValueError(f"Failed to AES-CBC encrypt password: {str(e)}")
