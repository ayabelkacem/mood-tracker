"use client";

import { useEffect, useState } from "react";

export default function MoodPrediction() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch("/api/predict")
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data) => setPrediction(data.predicted_mood))
      .catch(() => setUnavailable(true));
  }, []);

  if (unavailable) return null;

  if (prediction === null) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
        <p className="text-sm text-slate-400">Loading prediction...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-indigo-50 rounded-2xl shadow-sm p-6 mt-6 border border-indigo-100">
      <h2 className="text-sm font-medium text-indigo-700 mb-1">Predicted mood for today</h2>
      <p className="text-3xl font-semibold text-indigo-600">{prediction}/10</p>
      <p className="text-xs text-indigo-400 mt-2">
        A rough estimate based on your recent sleep and mood patterns — not a guarantee.
      </p>
    </div>
  );
}