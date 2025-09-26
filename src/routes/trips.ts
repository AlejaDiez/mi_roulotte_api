import { createTrip, deleteTrip, getAllTrips, getTripById, updateTrip } from "@controllers/trips";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllTrips);
router.get("/:trip_id", getTripById);
router.post("/", createTrip);
router.put("/:trip_id", updateTrip);
router.delete("/:trip_id", deleteTrip);

export default router;
