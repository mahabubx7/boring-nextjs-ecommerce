import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {

    const qs = new URL(request.url).searchParams;
    const accessToken = qs.get("access_token");
    const refreshToken = qs.get("refresh_token");

    console.log("\nDEBUG_API_OAUTH: ", {
        accessToken,
        refreshToken,
        url: request.url,
    })

    const newurl = new URL("/auth/oauth", request.url);

    if (!accessToken) {
        newurl.searchParams.set("error", "Access token is missing");
        return NextResponse.redirect(newurl);
    }

    newurl.searchParams.set("success", "true");
    newurl.searchParams.set("access", accessToken);
    newurl.searchParams.set("refresh", refreshToken || "");

    const r = NextResponse.redirect(newurl);
    r.cookies.set("auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 hour
    });

    return r;
}