import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/register", "/auth/login", "/auth/oauth"];
const superAdminRoutes = ["/super-admin", "/super-admim/:path*"];
const userRoutes = ["/home", "/game", "/game/:path*"];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (accessToken && accessToken.length > 0) {
    console.log("Access token found:", accessToken);
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      const { role } = payload as {
        role: string;
      };

      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(
            role === "SUPER_ADMIN" ? "/super-admin" : "/home",
            request.url
          )
        );
      }

      if (
        role === "SUPER_ADMIN" &&
        userRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      }
      if (
        role !== "SUPER_ADMIN" &&
        superAdminRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/home", request.url));
      }

      return NextResponse.next();
    } catch (e) {
      console.error("Token verification failed", e);
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_storage");
        request.cookies.delete("auth_token");
        request.cookies.delete("auth_rf_token");
      }

      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
