"use client";

import { useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";

type SavePhraseButtonProps = {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
};

const CATEGORIES = ["Greetings", "Trade", "Emergency"];

export default function SavePhraseButton({
  originalText,
  translatedText,
  sourceLang,
  targetLang,
}: SavePhraseButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (category: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText,
          translatedText,
          sourceLang,
          targetLang,
          category,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setShowPicker(false);
      }
    } catch (error) {
      console.warn("Failed to save phrase:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/20 text-green-300">
        <Check className="w-3.5 h-3.5" /> Saved
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPicker((prev) => !prev)}
        disabled={isSaving}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        title="Save phrase"
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Bookmark className="w-3.5 h-3.5" />
        )}
        Save
      </button>

      {showPicker && (
        <div className="absolute right-0 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 px-2 py-1">
            Select Tag
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSave(cat)}
              className="text-left text-xs text-gray-200 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}