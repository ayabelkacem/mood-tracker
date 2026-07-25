"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Entry = {
  createdAt: string;
  moodScore: number;
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MoodByWeekday({ entries }: { entries: Entry[] }) {
  // Group entries by day of week, then average
  const buckets: number[][] = [[], [], [], [], [], [], []];

  entries.forEach((entry) => {
    const day = new Date(entry.createdAt).getDay(); // 0 = Sunday
    buckets[day].push(entry.moodScore);
  });

  const data = weekdayNames.map((name, i) => {
    const scores = buckets[i];
    const avg = scores.length
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;
    return {
      day: name,
      avgMood: Math.round(avg * 10) / 10,
      count: scores.length,
    };
  });

  const hasEnoughData = entries.length >= 7;

  if (!hasEnoughData) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-sm font-medium text-slate-600 mb-2">Mood by day of week</h2>
        <p className="text-sm text-slate-400">Log at least a week of entries to see this pattern.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
      <h2 className="text-sm font-medium text-slate-600 mb-4">Mood by day of week</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value}/10 (${props.payload.count} entries)`,
              "Avg mood",
            ]}
          />
          <Bar dataKey="avgMood" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}