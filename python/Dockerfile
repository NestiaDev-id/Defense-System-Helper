# Gunakan base image Python
FROM python:3.11-slim

WORKDIR /app

# Salin file requirements
COPY python/requirements.txt requirements.txt

# Instal dependensi
# Jika pqcrypto memerlukan build dari source, pastikan base image memiliki build-essentials/gcc
# RUN apt-get update && apt-get install -y gcc build-essential # Contoh jika base image Debian/Ubuntu
RUN pip install --no-cache-dir -r requirements.txt

# Salin semua file aplikasi Python
COPY python/ /app/python/
# Atau jika Dockerfile ada di dalam direktori python:
# COPY . .

# Expose port yang digunakan Uvicorn
EXPOSE 8000

# Perintah untuk menjalankan Uvicorn
# Pastikan path ke main:app benar relatif terhadap WORKDIR
CMD ["uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", "8000"]