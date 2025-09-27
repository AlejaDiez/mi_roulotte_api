import {
    deleteStage,
    getAllStages,
    getStageById,
    insertStage,
    updateStage
} from "@controllers/stages";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllStages);
router.get("/:stage_id", getStageById);
router.post("/", insertStage);
router.put("/:stage_id", updateStage);
router.delete("/:stage_id", deleteStage);

export default router;
