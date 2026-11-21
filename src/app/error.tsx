"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      <AlertTriangle className="w-14 h-14 text-amber-500" />
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-gray-500 max-w-md text-sm">
        An unexpected error occurred. Try reloading this view.
      </p>
      <button
        onClick={() => reset()}
        className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </main>
  );
}