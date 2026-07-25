"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Entry = {
  createdAt: string;
  moodScore: number;
};

export default function MoodChart({ entries }: { entries: Entry[] }) {
  // Sort oldest to newest for a left-to-right timeline
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const data = sorted.map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    mood: entry.moodScore,
  }));

  if (data.length < 2) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-sm font-medium text-slate-600 mb-2">Mood over time</h2>
        <p className="text-sm text-slate-400">Log a few more entries to see your trend.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
      <h2 className="text-sm font-medium text-slate-600 mb-4">Mood over time</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}