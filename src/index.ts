import authRoutes from "@routes/auth";
import commentsRoutes from "@routes/comments";
import filesRoutes from "@routes/files";
import stagesRoutes from "@routes/stages";
import tripsRoutes from "@routes/trips";
import { Hono } from "hono";

const app = new Hono<Env>();

app.route("/auth", authRoutes);
app.route("/comments", commentsRoutes);
app.route("/files", filesRoutes);
app.route("/trips", tripsRoutes);
app.route("/trips/:trip_id/stages", stagesRoutes);

export default app;
