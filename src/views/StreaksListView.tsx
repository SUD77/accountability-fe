import { useEffect, useState } from "react";

/**
 * StreaksListView
 * ----------------
 * Fetches and displays all streaks for a given user.
 * - Shows loading / error / empty states
 * - Clicking a streak invokes onSelectStreak so the parent can switch views
 */

type Streak = {
  id: string;
  userId: string;
  name: string;
  startDate: string; // ISO date string from API
  endDate: string; // ISO date string from API
};

type Props = {
  userId: string; // which user's streaks to show
  onSelectStreak?: (streakId: string, streakName?: string) => void; // callback to parent
};

// Backend base URL (from Vite env). Falls back to localhost if not set.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function StreaksListView({ userId, onSelectStreak }: Props) {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * formatDate
   * ----------
   * Convert an ISO string to a nice, locale-aware date like "Aug 19, 2025".
   * If parsing fails, just return the raw string.
   */
  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return d;
    }
  }

  /**
   * load
   * ----
   * Fetch streaks for the current user.
   * Accepts an optional AbortSignal so we can cancel the request during unmount or param change.
   */
  async function load(opts?: { signal?: AbortSignal }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/streaks?userId=${encodeURIComponent(userId)}`,
        { signal: opts?.signal }
      );
      if (!res.ok) throw new Error(`Failed to load streaks (${res.status})`);
      const data = (await res.json()) as Streak[];
      setStreaks(data);
    } catch (e: any) {
      // Ignore abort errors (they happen when we cancel in-flight requests)
      if (e?.name !== "AbortError") setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  /**
   * useEffect
   * ---------
   * Load streaks on mount and whenever userId changes.
   * Uses AbortController to cancel the fetch if the component unmounts or userId changes quickly.
   */
  useEffect(() => {
    const controller = new AbortController();
    void load({ signal: controller.signal }); // kick off the load with cancellation support
    return () => controller.abort(); // cleanup: cancel in-flight request
  }, [userId]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header with title + manual refresh */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Streaks</h1>

        {/* IMPORTANT: wrap load() so the click event isn't passed as the "signal" param */}
        <button
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => {
            void load();
          }} // manual reload (no AbortSignal needed)
        >
          Refresh
        </button>
      </header>

      {/* Loading state */}
      {loading && <p className="text-sm text-gray-600">Loading streaks…</p>}

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && streaks.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-600">
          No streaks yet.
        </div>
      )}

      {/* Streak list */}
      <ul className="space-y-3">
        {streaks.map((s) => (
          <li key={s.id}>
            <button
              className="w-full rounded-2xl border bg-white p-4 text-left shadow-sm hover:shadow-md transition"
              onClick={() => onSelectStreak?.(s.id, s.name)} // tell parent which streak was chosen
              title="View goals"
            >
              <div className="flex items-center justify-between">
                <div>
                  {/* Name */}
                  <div className="text-base font-medium">{s.name}</div>

                  {/* Date range */}
                  <div className="text-xs text-gray-500">
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </div>
                </div>

                {/* Subtle affordance to indicate navigation */}
                <div className="text-xs text-gray-400">View goals →</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
