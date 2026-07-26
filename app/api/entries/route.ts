import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { mood, sleep, journal, tags } = body;

  // Call the Python ML service for sentiment analysis, if there's journal text
  let sentimentLabel: string | null = null;
  let sentimentScore: number | null = null;

  if (journal && journal.trim()) {
    try {
      const mlUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";
      const res = await fetch(`${mlUrl}/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: journal }),
      });
      if (res.ok) {
        const data = await res.json();
        sentimentLabel = data.label;
        sentimentScore = data.score;
      }
    } catch (err) {
      console.error("Sentiment analysis failed:", err);
      // Don't block saving the entry just because the ML service is unreachable
    }
  }

  const entry = await prisma.entry.create({
    data: {
      moodScore: mood,
      sleepHours: sleep ? parseFloat(sleep) : null,
      journalText: journal || null,
      tags: tags || [],
      sentimentLabel,
      sentimentScore,
      userId: session.user.id,
    },
  });

  return NextResponse.json(entry);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.entry.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, mood, sleep, journal, tags } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const result = await prisma.entry.updateMany({
    where: { id, userId: session.user.id },
    data: {
      moodScore: mood,
      sleepHours: sleep ? parseFloat(sleep) : null,
      journalText: journal || null,
      tags: tags || [],
    },
  });

  return NextResponse.json({ success: true, count: result.count });
}