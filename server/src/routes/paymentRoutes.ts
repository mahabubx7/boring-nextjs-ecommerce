import express from "express";
import { initiatePayment } from "../controllers/paymentController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/initiate", authenticateJwt, initiatePayment);

export default router;
