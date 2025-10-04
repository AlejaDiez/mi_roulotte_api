import authRoutes from "@routes/auth";
import stagesRoutes from "@routes/stages";
import tripsRoutes from "@routes/trips";
import { Hono } from "hono";

const app = new Hono<Env>();

app.route("/auth", authRoutes);
app.route("/trips", tripsRoutes);
app.route("/trips/:trip_id/stages", stagesRoutes);

export default app;
