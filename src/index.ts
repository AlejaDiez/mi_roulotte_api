import { auth } from "@middlewares/auth";
import stagesRoutes from "@routes/stages";
import tripsRoutes from "@routes/trips";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Define middlewares
app.use("*", auth);

// Define routes
app.route("/trips", tripsRoutes);
app.route("/trips/:trip_id/stages", stagesRoutes);

export default app;
