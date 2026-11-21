"use client";

import { useState, useEffect } from "react";
import { User, Volume2, Save, Loader2, Check } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");

  const [form, setForm] = useState({
    displayName: "",
    homeLanguage: "en",
    country: "Nigeria",
    defaultVoice: "default",
    autoPlayback: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const { user } = await res.json();
          setEmail(user?.email || "");
          setForm({
            displayName: user?.profile?.displayName || user?.name || "",
            homeLanguage: user?.profile?.homeLanguage || "en",
            country: user?.profile?.country || "Nigeria",
            defaultVoice: user?.profile?.defaultVoice || "default",
            autoPlayback: user?.profile?.autoPlayback ?? true,
          });
        }
      } catch (err) {
        console.warn("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-blue-500" />
          User Profile
        </h1>
        <p className="text-gray-500 mt-2">Manage your account and audio preferences.</p>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Account Details */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Account Information</h2>

          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-gray-400 text-sm cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 font-semibold mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-400 font-semibold mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Nigeria"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1.5">
              Home Language
            </label>
            <select
              value={form.homeLanguage}
              onChange={(e) => setForm({ ...form, homeLanguage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English (EN)</option>
              <option value="ha">Hausa (HA)</option>
              <option value="ig">Igbo (IG)</option>
              <option value="yo">Yoruba (YO)</option>
              <option value="fr">French (FR)</option>
            </select>
          </div>
        </section>

        {/* Audio Preferences */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Audio Preferences</h2>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Auto-Playback Translations</p>
              <p className="text-xs text-gray-400">
                Automatically speak translated text out loud after processing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.autoPlayback}
              onChange={(e) => setForm({ ...form, autoPlayback: e.target.checked })}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Preferences Saved" : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}