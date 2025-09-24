import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (ctx) => ctx.text("Mi Roulotte"));

serve({ fetch: app.fetch, port: 3010 }, (info) => {
    console.log("\x1b[42;1m hono \x1b[0m\n");
    console.log(`\x1b[90m┃\x1b[0m Local    \x1b[36mhttp://localhost:${info.port}/\x1b[0m\n`);
});
