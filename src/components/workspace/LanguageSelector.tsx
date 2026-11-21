"use client";

import { ArrowRightLeft } from "lucide-react";

// (Keep your SUPPORTED_LANGUAGES array here)
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "ha", name: "Hausa" },
  { code: "sw", name: "Swahili" },
  { code: "am", name: "Amharic" },
  { code: "zu", name: "Zulu" },
  { code: "sn", name: "Shona" },
  { code: "tw", name: "Twi" },
  { code: "so", name: "Somali" },
];

export function LanguageSelector({ sourceLang, setSourceLang, targetLang, setTargetLang }: any) {
  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm">
      <select 
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value)}
        className="flex-1 bg-transparent p-3 text-center text-xl font-bold text-gray-900 dark:text-white outline-none cursor-pointer appearance-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={`src-${lang.code}`} value={lang.code} className="bg-white text-black dark:bg-gray-800 dark:text-white text-lg font-medium">
            {lang.name}
          </option>
        ))}
      </select>

      <button onClick={handleSwap} className="p-4 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors mx-2 shadow-sm border border-gray-200 dark:border-gray-600">
        <ArrowRightLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      <select 
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className="flex-1 bg-transparent p-3 text-center text-xl font-bold text-gray-900 dark:text-white outline-none cursor-pointer appearance-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={`tgt-${lang.code}`} value={lang.code} className="bg-white text-black dark:bg-gray-800 dark:text-white text-lg font-medium">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}