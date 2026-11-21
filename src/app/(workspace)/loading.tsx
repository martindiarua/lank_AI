export default function WorkspaceLoading() {
  return (
    <main className="p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
      <div className="mt-4 space-y-3">
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-40 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}