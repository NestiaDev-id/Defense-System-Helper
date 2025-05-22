// api/index.ts
import { app } from "../app/app.js";
import { handle } from "@hono/node-server/vercel";

export default handle(app);

// Konfigurasi Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};
