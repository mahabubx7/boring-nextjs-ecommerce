import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gmail.com";
  const password = "123456";
  const name = "Super Admin";

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  const existingPrizeCouponTop5 = await prisma.coupon.count({
    where: { code: "top5hacker" },
  });

  if (!existingPrizeCouponTop5) {
    await prisma.coupon.create({
      data: {
        code: "top5hacker",
        discountPercent: 50, // 50% off
        startDate: new Date(),
        endDate: new Date(), // ignore this while validating
        usageLimit: -1,
        usageCount: 0,
      },
    });
  }

  const existingPrizeCouponTop10 = await prisma.coupon.count({
    where: { code: "top10hacker" },
  });

  if (!existingPrizeCouponTop10) {
    await prisma.coupon.create({
      data: {
        code: "top10hacker",
        discountPercent: 20, // 20% off
        startDate: new Date(),
        endDate: new Date(), // ignore this while validating
        usageLimit: -1,
        usageCount: 0,
      },
    });
  }

  if (existingSuperAdmin) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  const superAdminUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Super admin created successfully", superAdminUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
