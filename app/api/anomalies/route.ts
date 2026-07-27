import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const payload = entries.map((e) => ({
    mood: e.moodScore,
    created_at: e.createdAt.toISOString(),
  }));

  try {
    const mlUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";
    const res = await fetch(`${mlUrl}/anomalies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

if (!res.ok) {
  const errorText = await res.text();
  console.error("ML service returned error:", res.status, errorText);
  return NextResponse.json({ anomalies: [], status: res.status, error: errorText });
}

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Anomaly fetch failed:", err);
    return NextResponse.json({ anomalies: [], error: String(err) });
  }
}