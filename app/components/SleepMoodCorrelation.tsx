"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Entry = {
  moodScore: number;
  sleepHours: number | null;
};

// Pearson correlation coefficient: measures how strongly two variables move together.
// Returns a value from -1 (perfectly opposite) to 1 (perfectly together), 0 meaning no relationship.
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  const denominator = Math.sqrt(sumSqX * sumSqY);
  return denominator === 0 ? 0 : numerator / denominator;
}

export default function SleepMoodCorrelation({ entries }: { entries: Entry[] }) {
  const valid = entries.filter((e) => e.sleepHours !== null) as { moodScore: number; sleepHours: number }[];

  if (valid.length < 5) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-sm font-medium text-slate-600 mb-2">Sleep vs. mood</h2>
        <p className="text-sm text-slate-400">Log more entries with sleep hours to see this pattern.</p>
      </div>
    );
  }

  const sleepValues = valid.map((e) => e.sleepHours);
  const moodValues = valid.map((e) => e.moodScore);
  const correlation = pearsonCorrelation(sleepValues, moodValues);

  const describeCorrelation = (r: number) => {
    const strength = Math.abs(r);
    const direction = r > 0 ? "more" : "less";
    if (strength < 0.1) return "There's no clear relationship between your sleep and mood yet.";
    if (strength < 0.3) return `There's a slight tendency: ${direction} sleep is loosely linked to a better mood.`;
    if (strength < 0.5) return `There's a moderate pattern: ${direction} sleep tends to come with a better mood.`;
    return `There's a strong pattern: ${direction} sleep is closely linked to a better mood.`;
  };

  const data = valid.map((e) => ({ sleep: e.sleepHours, mood: e.moodScore }));

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
      <h2 className="text-sm font-medium text-slate-600 mb-1">Sleep vs. mood</h2>
      <p className="text-xs text-slate-400 mb-4">
        Correlation: {correlation.toFixed(2)} — {describeCorrelation(correlation)}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            dataKey="sleep"
            name="Sleep (hrs)"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <YAxis
            type="number"
            dataKey="mood"
            name="Mood"
            domain={[0, 10]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}