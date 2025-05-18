import { serve } from "@hono/node-server";
import { app } from "../app/app"; // pastikan path sesuai

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log("API Documentation is available at /docs");
  }
);
