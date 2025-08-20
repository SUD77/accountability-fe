import { useState } from "react";
import StreaksListView from "./views/StreaksListView";
import GoalsListView from "./views/GoalsListView";

export default function App() {
  const userId = "73b4d695-0047-45f5-a5cb-56f25d146830";

  const [selectedStreak, setSelectedStreak] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!selectedStreak ? (
        <StreaksListView
          userId={userId}
          onSelectStreak={(id, name) => setSelectedStreak({ id, name })}
        />
      ) : (
        <div className="mx-auto max-w-3xl p-6">
          {/* Back button OUTSIDE the goals view */}
          <button
            className="mb-4 text-sm text-blue-600 hover:underline"
            onClick={() => setSelectedStreak(null)}
          >
            ← Back to Streaks
          </button>

          {/* Header text only */}
          <h1 className="text-2xl font-semibold mb-4">
            {/* Goals{selectedStreak.name ? ` · ${selectedStreak.name}` : ""} */}
            Goal List
          </h1>

          {/* Goals view WITHOUT its own back button */}
          <GoalsListView
            streakId={selectedStreak.id}
            streakName={selectedStreak.name}
            onSelectGoal={(goalId, goalName, goalType) => {
              // you'll add selectedGoal state next and navigate to LogHistoryView
              console.log({ goalId, goalName, goalType });
            }}
          />
        </div>
      )}
    </div>
  );
}
