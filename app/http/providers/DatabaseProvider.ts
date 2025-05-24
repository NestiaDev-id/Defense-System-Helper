import { initializeApp, App as FirebaseApp, cert } from "firebase-admin/app"; // Untuk Firebase Admin SDK (backend)
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { MongoClient, Db as MongoDb } from "mongodb";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env.js"; // Pastikan path ini benar

// --- Firebase (Firestore Admin SDK) ---
let firestoreDb: Firestore | null = null;

// Fungsi untuk mendapatkan service account key dari environment variable
// Anda perlu menyimpan JSON service account key Anda sebagai string di environment variable
// atau path ke file jika Vercel mendukung file tersebut (lebih aman sebagai string env var)
function getFirebaseServiceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT_JSON tidak diatur. Firebase Admin SDK tidak akan diinisialisasi."
    );
    return null;
  }
  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error("Gagal mem-parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
    return null;
  }
}

export function initializeFirebaseAdmin(): void {
  if (firestoreDb) {
    console.log("Firebase Admin SDK sudah diinisialisasi.");
    return;
  }

  const serviceAccount = getFirebaseServiceAccount();
  if (serviceAccount) {
    try {
      // Hindari inisialisasi ganda jika sudah ada default app
      let firebaseApp: FirebaseApp;
      if (!initializeApp) {
        // Cek sederhana, lebih baik cek nama app jika ada
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
          // databaseURL: env.FIREBASE_DATABASE_URL, // Jika menggunakan Realtime Database juga
        });
      } else {
        // Jika sudah ada app default, gunakan itu atau buat app dengan nama spesifik
        // Untuk kesederhanaan, kita asumsikan belum ada atau kita pakai default
        // Ini mungkin perlu penyesuaian tergantung bagaimana Anda mengelola app Firebase
        firebaseApp = initializeApp(
          {
            // Ini bisa error jika app default sudah ada
            credential: cert(serviceAccount),
          },
          "defense-system-app"
        ); // Beri nama unik jika default app sudah ada
      }
      firestoreDb = getFirestore(firebaseApp);
      console.log("Firebase Admin SDK & Firestore berhasil diinisialisasi.");
    } catch (error: any) {
      // Tangani error jika app sudah ada
      if (error.code === "app/duplicate-app") {
        console.warn("Firebase app sudah diinisialisasi sebelumnya.");
        // Coba dapatkan instance yang sudah ada
        // Ini bagian yang agak tricky jika tidak dikelola dengan baik
        // Untuk Firestore, Anda mungkin bisa langsung getFirestore() jika default app sudah ada.
        // Atau gunakan getApp("defense-system-app") jika Anda menamainya.
        try {
          firestoreDb = getFirestore(); // Coba dapatkan default instance
        } catch (e) {
          console.error(
            "Gagal mendapatkan instance Firestore yang sudah ada:",
            e
          );
        }
      } else {
        console.error("Error saat inisialisasi Firebase Admin SDK:", error);
      }
    }
  }
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    // Mungkin panggil initializeFirebaseAdmin() di sini jika Anda ingin lazy init
    // Atau pastikan initializeFirebaseAdmin() sudah dipanggil saat startup aplikasi
    throw new Error(
      "Firestore belum diinisialisasi. Panggil initializeFirebaseAdmin() terlebih dahulu."
    );
  }
  return firestoreDb;
}

// --- MongoDB ---
let mongoDbInstance: MongoDb | null = null;
let mongoClientInstance: MongoClient | null = null;

export async function initializeMongoDB(): Promise<void> {
  if (mongoDbInstance) {
    console.log("MongoDB sudah terkoneksi.");
    return;
  }
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI tidak diatur. MongoDB tidak akan terkoneksi.");
    return;
  }
  try {
    mongoClientInstance = new MongoClient(env.MONGODB_URI);
    await mongoClientInstance.connect();
    mongoDbInstance = mongoClientInstance.db(env.MONGODB_DB_NAME); // Anda perlu MONGODB_DB_NAME di env
    console.log("Koneksi MongoDB berhasil.");
  } catch (error) {
    console.error("Error saat koneksi ke MongoDB:", error);
    // Mungkin lempar error atau tangani agar aplikasi tidak crash jika MongoDB opsional
  }
}

export function getMongoDb(): MongoDb {
  if (!mongoDbInstance) {
    throw new Error(
      "MongoDB belum terkoneksi. Panggil initializeMongoDB() terlebih dahulu."
    );
  }
  return mongoDbInstance;
}

export async function closeMongoDB(): Promise<void> {
  if (mongoClientInstance) {
    await mongoClientInstance.close();
    mongoClientInstance = null;
    mongoDbInstance = null;
    console.log("Koneksi MongoDB ditutup.");
  }
}

// --- Supabase ---
let supabaseClient: SupabaseClient | null = null;

export function initializeSupabase(): void {
  if (supabaseClient) {
    console.log("Supabase client sudah diinisialisasi.");
    return;
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.warn(
      "SUPABASE_URL atau SUPABASE_ANON_KEY tidak diatur. Supabase client tidak akan diinisialisasi."
    );
    return;
  }
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log("Supabase client berhasil diinisialisasi.");
  } catch (error) {
    console.error("Error saat inisialisasi Supabase client:", error);
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      "Supabase client belum diinisialisasi. Panggil initializeSupabase() terlebih dahulu."
    );
  }
  return supabaseClient;
}

// Fungsi global untuk menginisialisasi semua provider database saat startup
export async function initializeAllDatabaseProviders(): Promise<void> {
  initializeFirebaseAdmin(); // Inisialisasi Firebase
  await initializeMongoDB(); // Inisialisasi MongoDB
  initializeSupabase(); // Inisialisasi Supabase
}
