import { Clock, Globe, ArrowRight, MessageSquareOff, WifiOff } from "lucide-react";
import { db } from "@/lib/db";
import SavePhraseButton from "../../../components/workspace/SavePhraseButton";

export default async function HistoryPage() {
  let history: Awaited<ReturnType<typeof db.translation.findMany>> = [];
  let dbError = false;

  try {
    history = await db.translation.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Failed to load history from Neon:", error);
    dbError = true;
  }

  return (
    <main className="p-6 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh]">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-500" />
          Translation History
        </h1>
        <p className="text-gray-500 mt-2">Review your recently saved conversations.</p>
      </header>

      {dbError ? (
        <div className="flex flex-col items-center justify-center flex-1 text-amber-500 mt-20 gap-3 text-center">
          <WifiOff className="w-12 h-12 opacity-60" />
          <p className="text-lg font-medium">Database is waking up or unreachable.</p>
          <p className="text-sm text-gray-400">Wait a few seconds and refresh the page.</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400 mt-20 gap-4">
          <MessageSquareOff className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">No translations saved yet.</p>
          <p className="text-sm">Head over to the Live tab to start interpreting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              {/* Language Header + Save Button */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>{record.sourceLang}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span>{record.targetLang}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(record.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <SavePhraseButton
                    originalText={record.originalText}
                    translatedText={record.translatedText}
                    sourceLang={record.sourceLang}
                    targetLang={record.targetLang}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Original</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{record.originalText}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <p className="text-xs text-blue-400 font-semibold mb-1 uppercase">Translation</p>
                  <p className="text-blue-900 dark:text-blue-100 font-medium">{record.translatedText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}