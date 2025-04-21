import { type Response } from "express";
// import { SSLCommercez, SSLCommercezInitiateData } from "../config/sslcommercez";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

// const sslComz = new SSLCommercez({
//   storeId: process.env.SSL_STORE_ID as string,
//   storePassword: process.env.SSL_STORE_PASSWORD as string,
//   isLive: ["prod", "production"].includes(
//     (process.env.NODE_ENV as string).toLowerCase()
//   ),
// });

/// Initialize payment and redirect to payment gateway
export const initiatePayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { user } = req;

  const usr = await prisma.user.findUnique({
    where: {
      id: user?.userId,
    },
  }); // <-- Check if user exists

  if (!user || !usr) {
    res.status(401).json({
      success: false,
      message: "Unauthorized or Invalid user",
    }); // <-- Return if user is not found

    return;
  }

  // get init data
  const { data } = req.body as { data: Record<string, string> };
  // const makeInitData = sslComz.compose(
  //   data as unknown as SSLCommercezInitiateData
  // );

  // const payGate = await sslComz.initiatePayment(makeInitData);
  // console.log("payGate log: ", payGate);

  // if (payGate.GatewayPageURL) {
  //   console.log("Payment Gateway URL: ", payGate.GatewayPageURL);

  //   res.redirect(payGate.GatewayPageURL);
  // }

  res.status(500).json({
    success: false,
    message: "Unable to initiate payment",
  });
  return;
};
