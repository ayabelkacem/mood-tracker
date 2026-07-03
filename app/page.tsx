"use client";

import { useState } from "react";

export default function Home() {
  const [mood, setMood] = useState(5);
  const [journal, setJournal] = useState("");
  const [sleep, setSleep] = useState("");

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            How are you feeling today?
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Take a moment to check in with yourself.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Mood: {mood}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Hours of sleep last night
          </label>
          <input
            type="number"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="e.g. 7"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Anything on your mind?
          </label>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={4}
            placeholder="Write a few thoughts..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>

        <button
          onClick={async () => {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, sleep, journal }),
  });
  if (res.ok) {
    alert("Entry saved!");
    setJournal("");
    setSleep("");
    setMood(5);
  } else {
    alert("Something went wrong.");
  }
}}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition"
        >
          Save entry
        </button>
      </div>
    </main>
  );
}