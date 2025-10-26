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
router.post("/", addComments);
router.post("/unsubscribe-notifications", unsubscribeNotifications);
router.get("/:comment_id", getCommentById);
router.post("/:comment_id", replyComment);
router.delete("/:comment_id", authEditor, deleteComment);

export default router;
