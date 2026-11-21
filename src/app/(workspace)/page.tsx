"use client";

import { useState } from "react";
import { LanguageSelector } from "../../components/workspace/LanguageSelector";
import { MicrophoneButton } from "../../components/workspace/MicrophoneButton";

export default function LiveWorkspacePage() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ha"); // Defaulting to Hausa

  return (
    <main className="p-6 max-w-4xl mx-auto flex flex-col h-full min-h-[80vh]">
      <header className="mb-8 text-center mt-4">
        <h1 className="text-4xl font-bold tracking-tight">Live Interpreter</h1>
        <p className="text-gray-500 mt-2">Speak naturally. Translate instantly.</p>
      </header>
      
      <div className="w-full flex flex-col items-center gap-8 mt-4">
        <LanguageSelector 
          sourceLang={sourceLang} 
          setSourceLang={setSourceLang} 
          targetLang={targetLang} 
          setTargetLang={setTargetLang} 
        />

        <MicrophoneButton 
          sourceLang={sourceLang} 
          targetLang={targetLang} 
        />
      </div>
    </main>
  );
}