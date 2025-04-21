"use client";

// import Header from "@/components/user/header";
import { cn } from "@/lib/utils";

function GamePagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "w-full max-w-[768px] mx-auto bg-background border border-gray-200 rounded-md p-4 mt-4"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default GamePagesLayout;
