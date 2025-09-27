import { deleteTrip, getAllTrips, getTripById, insertTrip, updateTrip } from "@controllers/trips";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllTrips);
router.get("/:trip_id", getTripById);
router.post("/", insertTrip);
router.put("/:trip_id", updateTrip);
router.delete("/:trip_id", deleteTrip);

export default router;
