import { deleteFile, getAllFiles, getFileById, uploadFile } from "@controllers/files";
import { authEditor } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.get("/", authEditor, getAllFiles);
router.post("/", authEditor, uploadFile);
router.get("/:type/:name", authEditor, getFileById);
router.delete("/:type/:name", authEditor, deleteFile);

export default router;
