import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { mood, sleep, journal } = body;

  const entry = await prisma.entry.create({
    data: {
      moodScore: mood,
      sleepHours: sleep ? parseFloat(sleep) : null,
      journalText: journal || null,
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