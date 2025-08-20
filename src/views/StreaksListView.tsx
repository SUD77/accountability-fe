import { useEffect, useState } from "react";

type Streak = {
  id: string;
  userId: string;
  name: string;
  startDate: string; // ISO date string from API
  endDate: string;   // ISO date string from API
  // createdAt/updatedAt exist too, but we don't need them here
};

type Props = {
  userId: string;
  onSelectStreak?: (streakId: string, streakName?: string) => void;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function StreaksListView({ userId, onSelectStreak }: Props) {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function load() {
    setLoading(true);
    setError(null);
    const ac = new AbortController();
    try {
      const res = await fetch(`${API_URL}/streaks?userId=${encodeURIComponent(userId)}`, {
        signal: ac.signal,
      });
      if (!res.ok) {
        throw new Error(`Failed to load streaks (${res.status})`);
      }
      const data = (await res.json()) as Streak[];
      setStreaks(data);
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }

  useEffect(() => {
    const cancel = load();
    return () => {
      // @ts-expect-error cleanup from load()
      typeof cancel === "function" && cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Streaks</h1>
        <button
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={load}
        >
          Refresh
        </button>
      </header>

      {loading && <p className="text-sm text-gray-600">Loading streaks…</p>}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && streaks.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-600">
          No streaks yet.
        </div>
      )}

      <ul className="space-y-3">
        {streaks.map((s) => (
          <li key={s.id}>
            <button
              className="w-full rounded-2xl border bg-white p-4 text-left shadow-sm hover:shadow-md transition"
              onClick={() => onSelectStreak?.(s.id, s.name)}
              title="View goals"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">View goals →</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
