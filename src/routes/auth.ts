import {
    editProfile,
    getProfile,
    login,
    logout,
    refresh,
    register,
    verifyEmail,
    verifyTwoFactorAuth
} from "@controllers/auth";
import { authReader } from "@middlewares/auth";
import { Hono } from "hono";

const router = new Hono();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-two-factor-auth", verifyTwoFactorAuth);
router.get("/profile", authReader, getProfile);
router.put("/profile", authReader, editProfile);
router.delete("/logout", authReader, logout);

export default router;
