import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      <Compass className="w-14 h-14 text-blue-500 opacity-80" />
      <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
      <p className="text-gray-500 max-w-md text-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        Back to Live Interpreter
      </Link>
    </main>
  );
}