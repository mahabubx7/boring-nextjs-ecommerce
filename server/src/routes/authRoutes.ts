import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,
  googleSignIn,
  googleSignInCallback,
  whoAmI,
  getOAuthUserData,
} from "../controllers/authController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

router.post("/me", authenticateJwt, whoAmI);

// Google OAuth
router.get("/login/google", googleSignIn);
router.get("/callback/google", googleSignInCallback);
router.post("/oauth/authorize", getOAuthUserData);

export default router;
