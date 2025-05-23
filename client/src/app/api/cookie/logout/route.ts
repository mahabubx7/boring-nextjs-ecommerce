/// Set cookie
import { NextResponse } from "next/server";

export async function POST(request: Request) {

  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth_token");
  response.cookies.delete("auth_rf_token");

  return response;
}

