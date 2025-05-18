import { app } from "../app/app";

import { handle } from "@hono/node-server/vercel";

// Re-export the app with Vercel handler
export default handle(app);

// For Vercel, we need to export config
export const config = {
  api: {
    bodyParser: false,
  },
};
