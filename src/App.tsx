import { useState } from "react";
import StreaksListView from "./views/StreaksListView";

export default function App() {
  // TODO: replace with a real user id from your DB
  const [userId] = useState("73b4d695-0047-45f5-a5cb-56f25d146830");

  /* 
  - null means: show the Streaks list screen.
   - A value ({ id, name? }) means: a streak was clicked → switch to the “detail” screen (where you’ll later show goals).
  
  */
  const [selectedStreak, setSelectedStreak] = useState<{ id: string; name?: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!selectedStreak ? (
        <StreaksListView
          userId={userId}
          onSelectStreak={(id, name) => setSelectedStreak({ id, name })}
        />
      ) : (
        <div className="mx-auto max-w-3xl p-6">
          <button
            className="mb-4 text-sm text-blue-600 hover:underline"
            onClick={() => setSelectedStreak(null)}
          >
            ← Back to Streaks
          </button>
          <h1 className="text-2xl font-semibold mb-2">{selectedStreak.name ?? "Selected streak"}</h1>
          <p className="text-sm text-gray-600">Next step: show goals for this streak (coming next).</p>
        </div>
      )}
    </div>
  );
}

