/// Set cookie
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { accessToken } = await request.json();

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
    maxAge: 60 * 60,
  });

  return response;
}