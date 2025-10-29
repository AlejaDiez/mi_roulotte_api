import authRoutes from "@routes/auth";
import commentsRoutes from "@routes/comments";
import filesRoutes from "@routes/files";
import stagesRoutes from "@routes/stages";
import tripsRoutes from "@routes/trips";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<Env>();

app.use((ctx, next) =>
    cors({
        origin: [ctx.env.HOST, ctx.env.STUDIO_HOST],
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
        allowHeaders: ["Authorization", "X-Api-Key", "Content-Type", "X-Filename"]
    })(ctx, next)
);
app.route("/auth", authRoutes);
app.route("/comments", commentsRoutes);
app.route("/files", filesRoutes);
app.route("/trips", tripsRoutes);
app.route("/trips/:trip_id/stages", stagesRoutes);

export default app;
