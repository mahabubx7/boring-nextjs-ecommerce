import express from "express";
import {
  createCoupon,
  deleteCoupon,
  fetchAllCoupons,
  validateCoupon,
} from "../controllers/couponController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticateJwt);

router.get("/fetch-all-coupons", fetchAllCoupons);
router.post("/create-coupon", isSuperAdmin, createCoupon);
router.delete("/:id", isSuperAdmin, deleteCoupon);
router.post("/validate-coupon", authenticateJwt, validateCoupon);

export default router;
