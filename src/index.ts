import tripsRoutes from "@routes/trips";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Define routes
app.route("/trips", tripsRoutes);

export default app;
