import axios from "axios";
import { Response } from "express";
import { getCurrentWeekCode } from "../lib/week";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const createCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, discountPercent, startDate, endDate, usageLimit } = req.body;

    const newlyCreatedCoupon = await prisma.coupon.create({
      data: {
        code,
        discountPercent: parseInt(discountPercent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: parseInt(usageLimit),
        usageCount: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully!",
      coupon: newlyCreatedCoupon,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to created coupon",
    });
  }
};

export const fetchAllCoupons = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchAllCouponsList = await prisma.coupon.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.status(201).json({
      success: true,
      message: "Coupon created successfully!",
      couponList: fetchAllCouponsList,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon list",
    });
  }
};

export const deleteCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id },
    });

    res.status(201).json({
      success: true,
      message: "Coupon deleted successfully!",
      id: id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

export const validateCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, season = getCurrentWeekCode() } = req.query;
    const accessToken =
      (req.cookies.accessToken as string) ||
      (req.cookies.auth_token as string) ||
      (req.headers.authorization?.split(" ")[1] as string);

    if (!code || typeof code !== "string" || !accessToken) {
      res.status(400).json({
        success: false,
        message: "Invalid request",
        details: {
          code: code as string,
          accessToken: accessToken,
          season: season,
        },
      });
      return;
    }

    if (
      ["top5hacker", "top10hacker"].includes((code as string).toLowerCase())
    ) {
      // get user's rank
      const { data } = await axios.get(
        `${process.env.API_DOMAIN_URL}/api/game/get-user-rank?season=${season}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!data.rank) {
        res.status(400).json({
          success: false,
          message: "Error getting user's rank",
        });
        return;
      }

      const rank = data.rank as number;

      switch (code.toLowerCase()) {
        case "top5hacker":
          if (rank > 5) {
            res.status(400).json({
              success: false,
              message: `You are not eligible for this coupon. Your rank is ${rank}.`,
            });
            return;
          }

          // Check if the user has already used the coupon
          const couponUsage = await prisma.couponUser.findFirst({
            where: {
              coupon: {
                code: (code as string).toLowerCase(),
              },
              user: {
                id: req.user?.userId,
              },
              seasonId: season as string,
            },
          });

          if (couponUsage) {
            res.status(400).json({
              success: false,
              message: `You have already used this coupon.`,
            });
            return;
          }

          res.status(200).json({
            success: true,
            message: "Coupon is valid",
            coupon: {
              code: code.toLowerCase(),
              discountPercent: 50,
            },
          });
          break;
        case "top10hacker":
          if (rank > 10) {
            res.status(400).json({
              success: false,
              message: `You are not eligible for this coupon. Your rank is ${rank}.`,
            });
            return;
          }

          // Check if the user has already used the coupon
          const couponUsageTop10 = await prisma.couponUser.findFirst({
            where: {
              coupon: {
                code: code.toLowerCase(),
              },
              user: {
                id: req.user?.userId,
              },
              seasonId: season as string,
            },
          });
          if (couponUsageTop10) {
            res.status(400).json({
              success: false,
              message: `You have already used this coupon.`,
            });
            return;
          }
          res.status(200).json({
            success: true,
            message: "Coupon is valid",
            coupon: {
              code: code.toLowerCase(),
              discountPercent: 20,
            },
          });

          break;
        default:
          res.status(400).json({
            success: false,
            message: `You are not eligible for this coupon. Your rank is ${rank}.`,
          });
      }
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: "Coupon not found or expired",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      coupon,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};
