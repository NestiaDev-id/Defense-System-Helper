import { Hono } from "hono";
import { apiReference } from "@scalar/hono-api-reference";

const app = new Hono();

app.get("/", apiReference({ theme: "default", layout: "classic" }));

export default app;
