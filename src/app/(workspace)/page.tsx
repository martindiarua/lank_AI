import { LanguageSelector } from "../../components/workspace/LanguageSelector";
import { MicrophoneButton } from "../../components/workspace/MicrophoneButton";

export default function LiveWorkspacePage() {
  return (
    <main className="p-6 max-w-4xl mx-auto flex flex-col h-full min-h-[80vh]">
      <header className="mb-8 text-center mt-4">
        <h1 className="text-4xl font-bold tracking-tight">Live Interpreter</h1>
        <p className="text-gray-500 mt-2">Speak naturally. Translate instantly.</p>
      </header>
      
      <div className="w-full flex flex-col items-center gap-8 mt-4">
        {/* Day 7: Language Selection Bar */}
        <LanguageSelector />

        {/* Day 8: Active Microphone Trigger */}
        <MicrophoneButton />
      </div>
    </main>
  );
}