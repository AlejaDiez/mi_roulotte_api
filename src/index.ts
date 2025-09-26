import tripsRoutes from "@routes/trips.js";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Define routes
app.route("/trips", tripsRoutes);

export default app;
