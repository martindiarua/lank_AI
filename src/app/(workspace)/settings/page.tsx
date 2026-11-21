"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, WifiOff, ShieldCheck, LogOut, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [offlineMode, setOfflineMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const { user } = await res.json();
          setOfflineMode(user?.profile?.offlineMode ?? false);
        }
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const toggleOfflineMode = async (checked: boolean) => {
    setOfflineMode(checked);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offlineMode: checked }),
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="p-6 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-500" />
          App Settings
        </h1>
        <p className="text-gray-500 mt-2">System configurations and data management.</p>
      </header>

      {/* System Preferences */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Offline-First Mode</p>
              <p className="text-xs text-gray-400">
                Prioritize cached saved phrases and browser native speech when network is unstable.
              </p>
            </div>
          </div>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => toggleOfflineMode(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          )}
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Resilient Translation Cascade</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Active Pipeline: Groq Primary → N-ATLAS (African Languages) → OpenAI GPT-4o-mini → Safe Fallback.
            </p>
          </div>
        </div>
      </section>

      {/* Session / Account Action */}
      <section className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-500">Sign Out</p>
          <p className="text-xs text-gray-400">
            End your current session and return to the login screen.
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Log Out
        </button>
      </section>
    </main>
  );
}