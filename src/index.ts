import { auth } from "@middlewares/auth";
import tripsRoutes from "@routes/trips";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Define middlewares
app.use("*", auth);

// Define routes
app.route("/trips", tripsRoutes);

export default app;
