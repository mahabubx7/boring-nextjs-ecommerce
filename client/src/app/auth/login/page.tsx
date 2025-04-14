"use client";

import LoginPageComponent from "@/components/pages/login";
import { useAuthStore } from "@/store/useAuthStore";



function LoginPage() {
  const user = useAuthStore((state) => state.user);

  
  if (user ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Welcome Back!</h1>
        <p className="mt-4">You are already logged in.</p>
      </div>
    )
  }

  return <LoginPageComponent />;
};


export default LoginPage;
