"use client";

import { Suspense } from "react";
import OAuthCallbackHandler from "../../../components/pages/oauth-callback";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
