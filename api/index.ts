import { app } from "../app/app";

import { handle } from "@hono/node-server/vercel";

// Re-export the app with Vercel handler
// export default handle(app);

// Re-export the app with Vercel handler
export const handler = async (request: Request) => {
  return new Response("Hello from test handler!", { status: 200 });
};

// For Vercel, we need to export config
export const config = {
  api: {
    bodyParser: false,
  },
};
