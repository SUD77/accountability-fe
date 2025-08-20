import { useState } from "react";
import StreaksListView from "./views/StreaksListView";
import GoalsListView from "./views/GoalsListView";
import LogHistoryView from "./views/LogHistoryView";

export default function App() {
  // ⚙️ Dev-only: hardcode a user for now (replace with a real user later)
  const userId = "73b4d695-0047-45f5-a5cb-56f25d146830";

  /**
   * 🧭 Simple "navigation" state (no router yet)
   * - selectedStreak: which streak we're viewing goals for
   * - selectedGoal:   which goal we're viewing logs for
   *
   * If both are null → show Streaks
   * If streak picked & goal is null → show Goals for that streak
   * If streak picked & goal picked  → show Logs for that goal
   */
  const [selectedStreak, setSelectedStreak] = useState<{ id: string; name?: string } | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<{
    id: string;
    name?: string;
    type?: "binary" | "count";
    unit?: string | null; // optional (we can pass it later if/when needed)
  } | null>(null);

  // 🎛️ Tiny helpers to make the JSX below easier to read
  const showStreaks = !selectedStreak;
  const showGoals = !!selectedStreak && !selectedGoal;
  const showLogs = !!selectedStreak && !!selectedGoal;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ======== STREAKS LIST ======== */}
      {showStreaks && (
        <StreaksListView
          userId={userId}
          onSelectStreak={(id, name) => {
            // When a streak is chosen, go to the Goals view for that streak.
            setSelectedGoal(null); // defensive reset
            setSelectedStreak({ id, name });
          }}
        />
      )}

      {/* ======== GOALS LIST (for a streak) ======== */}
      {showGoals && (
        <div className="mx-auto max-w-3xl p-6">
          {/* Back button OUTSIDE the goals view (as you prefer) */}
          <button
            className="mb-4 text-sm text-blue-600 hover:underline"
            onClick={() => {
              // Go back to Streaks (clear both selections)
              setSelectedGoal(null);
              setSelectedStreak(null);
            }}
          >
            ← Back to Streaks
          </button>

          {/* Header text only (no component inside headings) */}
          <h1 className="text-2xl font-semibold mb-4">
            Goal List{selectedStreak?.name ? ` · ${selectedStreak.name}` : ""}
          </h1>

          <GoalsListView
            streakId={selectedStreak!.id}
            streakName={selectedStreak?.name}
            onSelectGoal={(goalId, goalName, goalType) => {
              // Move to the Logs view for this goal.
              // If you later want `unit`, extend GoalsListView to pass it too.
              setSelectedGoal({ id: goalId, name: goalName, type: goalType });
            }}
          />

          {/* Optional helper text to guide the flow */}
          <p className="mt-6 text-sm text-gray-600">Select a goal to view its log history.</p>
        </div>
      )}

      {/* ======== LOG HISTORY (for a goal) ======== */}
      {showLogs && (
        <div className="mx-auto max-w-3xl p-6">
          {/* Back button OUTSIDE the logs view (keeps header consistent) */}
          <button
            className="mb-4 text-sm text-blue-600 hover:underline"
            onClick={() => {
              // Go back to Goals (keep the selected streak)
              setSelectedGoal(null);
            }}
          >
            ← Back to Goals
          </button>

          <h1 className="text-2xl font-semibold mb-4">
            Log History{selectedGoal?.name ? ` · ${selectedGoal.name}` : ""}
          </h1>

          <LogHistoryView
            goalId={selectedGoal!.id}
            goalName={selectedGoal?.name}
            goalType={selectedGoal?.type}
            unit={selectedGoal?.unit} // ok if undefined; values will still render
          />
        </div>
      )}
    </div>
  );
}
