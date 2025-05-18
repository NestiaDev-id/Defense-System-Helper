import { app } from "../app/app";

// Vercel expects a named export `handler` which is a function
export const handler = async (request: Request) => {
  return app.fetch(request);
};
