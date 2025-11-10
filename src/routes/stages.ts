import {
    deleteStage,
    getAllStages,
    getStageById,
    insertStage,
    updateStage
} from "@controllers/stages";
import { authEditor, authGuest } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.get("/", authGuest, getAllStages);
router.post("/", authEditor, insertStage);
router.get("/:stage_id", authGuest, getStageById);
router.put("/:stage_id", authEditor, updateStage);
router.delete("/:stage_id", authEditor, deleteStage);

export default router;
