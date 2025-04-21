"use client";

import { protectSignInAction } from "@/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/utils/api";
import { PUBLIC_DOMAIN } from "@/utils/config";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import googleIcon from "../../../public/google.svg";
import banner from "../../../public/images/banner2.jpg";
import logo from "../../../public/images/logo1.png";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function LoginPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const { login, user, getUser } = useAuthStore();

  const hasError = searchParams.get("error");

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const checkFirstLevelOfValidation = await protectSignInAction(
      formData.email
    );

    if (!checkFirstLevelOfValidation.success) {
      toast({
        title: checkFirstLevelOfValidation.error,
        variant: "destructive",
      });
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      toast({
        title: "Login Successfull!",
        variant: "destructive",
        color: "green",
      });

      await getUser();

      /// redirect handle manually
      const url = "/home";
      window.history.pushState({}, "", url);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6f4] flex">
      <div className="hidden lg:block w-1/2 bg-[#ffede1] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center">
            <Image src={logo} width={200} height={50} alt="Logo" />
          </div>

          <div className="py-4 px-2 flex flex-col max-w-md my-4">
            <Button
              onClick={() =>
                window.open(
                  `${API_BASE_URL}/api/auth/login/google?redirect_uri=${PUBLIC_DOMAIN}/auth/oauth`,
                  "_self"
                )
              }
              className="max-w-md mx-auto block mt-4 bg-black text-white hover:bg-black transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <span>
                  {/* <img src="/google.svg" alt="google-logo-icon" /> */}
                  <Image
                    src={googleIcon}
                    alt="google-logo-icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>Continue with Google</span>
              </span>
            </Button>
          </div>

          {hasError && (
            <div className="text-sm py-2 px-2.5 mb-4 rounded-md bg-red-100 text-red-700 border border-red-200">
              <p className="text-center">Error: {hasError}</p>
            </div>
          )}

          {user?.id && (
            <div className="text-sm py-4 px-2.5 mb-8 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <p className="text-center">
                You are already logged in as{" "}
                <span className="font-bold">{user?.email}</span>
              </p>

              <Button
                className="max-w-sm mx-auto block mt-4 bg-black text-white hover:bg-black transition-colors"
                onClick={() => {
                  if (user.role === "SUPER_ADMIN")
                    return router.push("/super-admin");
                  return router.push("/home");
                }}
              >
                Go back to Dashboard
              </Button>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="bg-[#ffede1]"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleOnChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="bg-[#ffede1]"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleOnChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black transition-colors"
            >
              LOGIN
            </Button>
            <p className="text-center text-[#3f3d56] text-sm">
              New here{" "}
              <Link
                href={"/auth/register"}
                className="text-[#000] hover:underline font-bold"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LoginPageComponent;
