import {
    addComments,
    deleteComment,
    getAllComments,
    getCommentById,
    replyComment,
    unsubscribeNotifications
} from "@controllers/comments";
import { authEditor } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.get("/", getAllComments);
router.get("/:comment_id", getCommentById);
router.post("/", addComments);
router.post("/:comment_id", replyComment);
router.delete("/:comment_id", authEditor, deleteComment);
router.post("/unsubscribe-notifications", unsubscribeNotifications);

export default router;
