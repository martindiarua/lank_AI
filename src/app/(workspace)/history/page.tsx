export default function HistoryPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Conversation History</h1>
        <p className="text-gray-500 mt-2">Review your past translations and discussions.</p>
      </header>

      {/* Placeholder for Week 3 History Threading */}
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-950">
          <p className="text-gray-500 text-sm">No recent conversations found.</p>
        </div>
      </div>
    </main>
  );
}