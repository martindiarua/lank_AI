export default function SavedPhrasesPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Saved Phrases</h1>
        <p className="text-gray-500 mt-2">Your bookmarked translations for quick access.</p>
      </header>

      {/* Placeholder for Week 4 Saved Phrases UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-950">
          <p className="text-gray-500 text-sm">No saved phrases yet.</p>
        </div>
      </div>
    </main>
  );
}