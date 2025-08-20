import { useEffect, useState } from "react";

/**
 * LogHistoryView
 * ---------------
 * Shows log entries for a selected goal, with an optional date range filter.
 * - GET /log-entries?goalId=<id>&from=YYYY-MM-DD&to=YYYY-MM-DD
 * - Loading / error / empty states
 * - Refresh button
 * - No Back button here (keep it in the parent, like Goals)
 */

type GoalType = "binary" | "count";

type LogEntry = {
  id: string;
  goalId: string;
  localDate: string;    // ISO date from API (often midnight UTC)
  value: number | string | null; // for "count" goals (Prisma Decimal may be string)
  done: boolean | null; // for "binary" goals
  note: string | null;
  createdAt?: string;
  editedAt?: string | null;
};

type Props = {
  goalId: string;
  goalName?: string;
  goalType?: GoalType;
  unit?: string | null; // e.g., "ml" for count goals
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function LogHistoryView({ goalId, goalName, goalType, unit }: Props) {
  // UI state
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple date range (YYYY-MM-DD)
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  /** Pretty date for display */
  function fmt(d: string) {
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

  /** Render value/status based on goal type */
  function renderValue(e: LogEntry) {
    if (goalType === "binary") {
      return e.done ? "Done" : "Not done";
    }
    // count
    const n = e.value != null ? Number(e.value) : null;
    if (n != null && !Number.isNaN(n)) {
      return unit ? `${n} ${unit}` : `${n}`;
    }
    return "—";
  }

  /** Build the URL with current filters */
  function buildUrl() {
    const params = new URLSearchParams();
    params.set("goalId", goalId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `${API_URL}/log-entries?${params.toString()}`;
  }

  /** Load entries (supports AbortSignal) */
  async function load(opts?: { signal?: AbortSignal }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(), { signal: opts?.signal });
      if (!res.ok) throw new Error(`Failed to load log entries (${res.status})`);
      const data = (await res.json()) as LogEntry[];
      setEntries(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  /** Fetch on mount / when goalId or filters change */
  useEffect(() => {
    const controller = new AbortController();
    void load({ signal: controller.signal });
    return () => controller.abort();
  }, [goalId, from, to]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header (title kept simple; Back lives in parent) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Logs{goalName ? ` · ${goalName}` : ""} {goalType ? `· ${goalType}` : ""}
        </h2>
      </div>

      {/* Filters + Refresh */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <div className="mb-1 text-gray-600">From</div>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
        </label>

        <label className="text-sm">
          <div className="mb-1 text-gray-600">To</div>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
        </label>

        <button
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => { void load(); }} // manual refresh
        >
          Refresh
        </button>
      </div>

      {/* States */}
      {loading && <p className="text-sm text-gray-600">Loading logs…</p>}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-600">
          No logs in this range.
        </div>
      )}

      {/* List */}
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{fmt(e.localDate)}</div>
                <div className="text-sm text-gray-700">{renderValue(e)}</div>
                {e.note && <div className="mt-1 text-xs text-gray-500">“{e.note}”</div>}
              </div>
              {e.editedAt && (
                <div className="text-[11px] text-gray-400 self-center">
                  edited {fmt(e.editedAt)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
