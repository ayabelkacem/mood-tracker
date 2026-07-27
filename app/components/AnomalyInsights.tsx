"use client";

import { useEffect, useState } from "react";

type Anomaly = {
  type: string;
  message: string;
};

export default function AnomalyInsights() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    fetch("/api/anomalies")
      .then((res) => res.json())
      .then((data) => setAnomalies(data.anomalies || []))
      .catch(() => setAnomalies([]));
  }, []);

  if (anomalies.length === 0) return null;

  return (
    <div className="w-full max-w-md bg-amber-50 border border-amber-100 rounded-2xl shadow-sm p-6 mt-6">
      <h2 className="text-sm font-medium text-amber-700 mb-3">Patterns worth noticing</h2>
      <div className="space-y-2">
        {anomalies.map((a, i) => (
          <p key={i} className="text-sm text-amber-800">
            {a.message}
          </p>
        ))}
      </div>
      <p className="text-xs text-amber-500 mt-3">
        These are descriptive observations about your own data, not a diagnosis. If something here concerns you, consider talking to a professional.
      </p>
    </div>
  );
}