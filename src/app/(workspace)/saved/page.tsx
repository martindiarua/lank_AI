"use client";

import { useState, useEffect } from "react";
import { Search, Tag, Volume2, Bookmark, Loader2, Globe } from "lucide-react";

// Types based on Prisma schema
type SavedPhrase = {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  category: string;
  createdAt: string;
};

const CATEGORIES = ["All", "Trade", "Emergency", "Greetings"];

export default function SavedPhrasesPage() {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch saved phrases on mount
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/saved");
        if (res.ok) {
          const data = await res.json();
          setPhrases(data.phrases);
        }
      } catch (error) {
        console.error("Failed to fetch saved phrases", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const speakPhrase = (text: string, langCode: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Filter logic for search and categories
  const filteredPhrases = phrases.filter((phrase) => {
    const matchesSearch = 
      phrase.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.translatedText.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || phrase.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="p-6 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh]">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-blue-500" />
          Saved Phrases
        </h1>
        <p className="text-gray-500 mt-2">Access your bookmarked translations instantly.</p>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search phrases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat !== "All" && <Tag className="w-3 h-3" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredPhrases.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400 mt-10 gap-4">
          <Bookmark className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">No saved phrases found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPhrases.map((phrase) => (
            <div key={phrase.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>{phrase.sourceLang} → {phrase.targetLang}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">
                  {phrase.category}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Original</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{phrase.originalText}</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 relative group">
                  <p className="text-xs text-blue-400 font-semibold mb-1 uppercase">Translation</p>
                  <p className="text-blue-900 dark:text-blue-100 font-medium pr-8">{phrase.translatedText}</p>
                  
                  <button 
                    onClick={() => speakPhrase(phrase.translatedText, phrase.targetLang)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-200 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Replay Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}