/// Set cookie
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
        return NextResponse.json(
        { success: false, message: "Tokens are missing" },
        { status: 400 }
        );
    }

  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}