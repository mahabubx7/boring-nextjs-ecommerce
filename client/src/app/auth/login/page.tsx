"use client";

import LoginPageComponent from "@/components/pages/login";
import { Suspense } from "react";

function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      }
    >
      <LoginPageComponent />
    </Suspense>
  );
}

export default LoginPage;
