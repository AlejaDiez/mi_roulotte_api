import {
    deleteStage,
    getAllStages,
    getStageById,
    insertStage,
    updateStage
} from "@controllers/stages";
import { authEditor } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllStages);
router.post("/", authEditor, insertStage);
router.get("/:stage_id", getStageById);
router.put("/:stage_id", authEditor, updateStage);
router.delete("/:stage_id", authEditor, deleteStage);

export default router;
