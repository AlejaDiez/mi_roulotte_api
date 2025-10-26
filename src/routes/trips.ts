import { deleteTrip, getAllTrips, getTripById, insertTrip, updateTrip } from "@controllers/trips";
import { authEditor } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllTrips);
router.post("/", authEditor, insertTrip);
router.get("/:trip_id", getTripById);
router.put("/:trip_id", authEditor, updateTrip);
router.delete("/:trip_id", authEditor, deleteTrip);

export default router;
