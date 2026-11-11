export default function ProfilePage() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-gray-500 mt-2">Manage your account and preferences.</p>
      </header>

      {/* Placeholder for Profile Form */}
      <div className="p-6 border rounded-xl bg-white dark:bg-gray-950 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Audio Preferences</h2>
          <p className="text-sm text-gray-500 mb-4">Configure how translations are played back.</p>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="text-gray-400 text-sm">Settings form loading...</span>
          </div>
        </div>
      </div>
    </main>
  );
}