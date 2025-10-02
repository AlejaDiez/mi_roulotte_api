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

router.post("/login", login);
router.post("/register", register);
router.post("/logout", authReader, logout);
router.post("/refresh", refresh);
router.get("/profile", authReader, getProfile);
router.put("/profile", authReader, editProfile);
router.post("/verify-email", verifyEmail);
router.post("/verify-two-factor-auth", verifyTwoFactorAuth);

export default router;
