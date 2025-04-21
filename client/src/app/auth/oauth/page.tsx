"use client";

import { useAuthStore } from "@/store/useAuthStore";
// import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { authorizeOAuthUser } = useAuthStore((state) => state);

  if (!params) {
    return (
      <>
        <h1>Loading...</h1>
        <p>Please wait while we process your request.</p>
      </>
    );
  }

  const ouid = params.get("ouid");
  const success = params.get("success");

  useEffect(() => {
    if (success === "true" && ouid) {
      authorizeOAuthUser(ouid)
        .then(() => {
          setTimeout(() => {
            router.push("/");
          }, 1000);

          return;
        })
        .catch((error) => {
          console.error("Error authorizing OAuth user:", error);
        });
    } else if (success === "false") {
      console.error("OAuth authorization failed");
    }
  }, [ouid, success]);

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      {/* <h1>OAuth Callback</h1>
      <p>Success: {success}</p>
      <p>OUID: {ouid}</p>
      <p>Error: {params.get("error") || "<None>"}</p> */}

      {success === "true" ? (
        <div className="bg-green-50 text-green-600 p-4 rounded-md">
          <h1 className="text-2xl font-bold">
            OAuth Authorization Successful!
          </h1>
          <p className="mt-4">You have been successfully authorized.</p>
          <p className="mt-2">Redirecting you to the home page...</p>
        </div>
      ) : (
        <div className="bg-red-100 text-red-600 p-4 rounded-md">
          <h1 className="text-2xl font-bold">OAuth Authorization Failed</h1>
          <p className="mt-4">
            Unfortunately, the OAuth authorization was not successful.
          </p>
          <p className="mt-2">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      )}
    </div>
  );
}
