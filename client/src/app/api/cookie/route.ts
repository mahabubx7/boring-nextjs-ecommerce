/// Set cookie
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { accessToken, refreshToken } = await request.json();

    if (!accessToken) {
        return NextResponse.json(
        { success: false, message: "Access token is missing" },
        { status: 400 }
        );
    }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 1000, // 1 day
  });
  response.cookies.set("auth_rf_token", refreshToken || '<empty>', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  });

  return response;
}

