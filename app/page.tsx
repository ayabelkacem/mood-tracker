"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mood, setMood] = useState(5);
  const [journal, setJournal] = useState("");
  const [sleep, setSleep] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const availableTags = ["work", "social", "health", "family", "sleep", "exercise"];

  const loadEntries = async () => {
    const res = await fetch("/api/entries");
    if (res.ok) {
      const data = await res.json();
      setEntries(data);
    } else {
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setMood(entry.moodScore);
    setSleep(entry.sleepHours?.toString() || "");
    setJournal(entry.journalText || "");
    setTags(entry.tags || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      {session ? (
        <div className="w-full max-w-md flex justify-between items-center mb-2 text-sm">
          <span className="text-slate-400">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-indigo-500 hover:underline"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex justify-end gap-4 mb-2 text-sm">
          <a href="/signup" className="text-indigo-500 hover:underline">Sign up</a>
          <a href="/login" className="text-indigo-500 hover:underline">Log in</a>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-6 mt-6">
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

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  tags.includes(tag)
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={async () => {
            const method = editingId ? "PUT" : "POST";
            const payload = editingId
              ? { id: editingId, mood, sleep, journal, tags }
              : { mood, sleep, journal, tags };

            const res = await fetch("/api/entries", {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              alert(editingId ? "Entry updated!" : "Entry saved!");
              setJournal("");
              setSleep("");
              setMood(5);
              setTags([]);
              setEditingId(null);
              loadEntries();
            } else {
              alert("Something went wrong.");
            }
          }}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition"
        >
          {editingId ? "Update entry" : "Save entry"}
        </button>
      </div>

      <div className="w-full max-w-md mt-6 space-y-3 pb-10">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">
                Mood: {entry.moodScore}/10
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => startEdit(entry)}
                  className="text-xs text-indigo-400 hover:text-indigo-600"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Delete this entry?")) {
                      await fetch(`/api/entries?id=${entry.id}`, { method: "DELETE" });
                      loadEntries();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            {entry.journalText && (
              <p className="text-sm text-slate-500 mt-1">{entry.journalText}</p>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}