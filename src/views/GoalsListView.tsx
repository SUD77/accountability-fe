import { useEffect, useState } from "react";

/**
 * GoalsListView
 * -------------
 * Shows all goals for a selected streak.
 * - Fetches from GET /goals?streakId=<id>
 * - Handles loading, error, empty states
 * - Click a goal → onSelectGoal(goalId, goalName, goalType)
 */

type GoalType = "binary" | "count";

type Goal = {
  id: string;
  streakId: string;
  name: string;
  type: GoalType;
  unit: string | null;                 // e.g., "ml" (count goals)
  perDayTarget: number | string | null; // Prisma Decimal may serialize as string
};

type Props = {
  streakId: string;
  streakName?: string;
  onSelectGoal?: (goalId: string, goalName?: string, goalType?: GoalType) => void;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function GoalsListView({ streakId, streakName, onSelectGoal }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatTarget(goal: Goal) {
    if (goal.type !== "count") return "binary";
    const n = goal.perDayTarget != null ? Number(goal.perDayTarget) : null;
    const unit = goal.unit ?? "";
    if (n != null && !Number.isNaN(n)) {
      return unit ? `${n} ${unit}/day` : `${n}/day`;
    }
    return unit ? `${unit}/day` : "count";
  }

  async function load(opts?: { signal?: AbortSignal }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/goals?streakId=${encodeURIComponent(streakId)}`, {
        signal: opts?.signal,
      });
      if (!res.ok) throw new Error(`Failed to load goals (${res.status})`);
      const data = (await res.json()) as Goal[];
      setGoals(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void load({ signal: controller.signal });
    return () => controller.abort();
  }, [streakId]);

  return (
    <div>
      {/* Header is handled by the parent; this view focuses on content */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {streakName ? `Streak: ${streakName}` : ""}
        </div>
        <button
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => { void load(); }}
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading goals…</p>}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && goals.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-600">
          No goals in this streak.
        </div>
      )}

      <ul className="space-y-3">
        {goals.map((g) => (
          <li key={g.id}>
            <button
              className="w-full rounded-2xl border bg-white p-4 text-left shadow-sm hover:shadow-md transition"
              onClick={() => onSelectGoal?.(g.id, g.name, g.type)}
              title="View log history"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">{g.name}</div>
                  <div className="text-xs text-gray-500">
                    {g.type === "binary" ? "binary" : formatTarget(g)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">View logs →</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
