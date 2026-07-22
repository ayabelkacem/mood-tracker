"use client";

type Entry = {
  createdAt: string;
  moodScore: number;
};

export default function StreakCalendar({ entries }: { entries: Entry[] }) {
  const daysToShow = 84; // 12 weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map dates (YYYY-MM-DD) to mood scores, using the latest entry per day
  const moodByDate = new Map<string, number>();
  entries.forEach((entry) => {
    const d = new Date(entry.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    moodByDate.set(key, entry.moodScore);
  });

  const days: { key: string; mood: number | null }[] = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ key, mood: moodByDate.get(key) ?? null });
  }

  // Calculate current streak (consecutive days ending today with an entry)
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].mood !== null) {
      streak++;
    } else {
      break;
    }
  }

  const colorForMood = (mood: number | null) => {
    if (mood === null) return "bg-slate-100";
    if (mood <= 3) return "bg-red-200";
    if (mood <= 5) return "bg-amber-200";
    if (mood <= 7) return "bg-lime-300";
    return "bg-emerald-400";
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-slate-600">Last 12 weeks</h2>
        <span className="text-xs text-slate-400">
          🔥 {streak} day{streak === 1 ? "" : "s"} streak
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.key}${day.mood !== null ? ` — mood ${day.mood}/10` : ""}`}
            className={`w-full aspect-square rounded-sm ${colorForMood(day.mood)}`}
          />
        ))}
      </div>
    </div>
  );
}