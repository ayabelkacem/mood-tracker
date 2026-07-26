import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the user's most recent entries to compute inputs for the model
  const recentEntries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (recentEntries.length === 0) {
    return NextResponse.json({ error: "Not enough data yet" }, { status: 400 });
  }

  const recentMoodAvg =
    recentEntries.reduce((sum, e) => sum + e.moodScore, 0) / recentEntries.length;

  const latestSleep = recentEntries[0].sleepHours ?? 7;
  const latestTags = recentEntries[0].tags || [];

  try {
    const mlUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";
    const res = await fetch(`${mlUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sleep: latestSleep,
        recent_mood_avg: recentMoodAvg,
        has_work_tag: latestTags.includes("work"),
        has_health_tag: latestTags.includes("health"),
        has_social_tag: latestTags.includes("social"),
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Prediction service unavailable" }, { status: 503 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Prediction service unavailable" }, { status: 503 });
  }
}