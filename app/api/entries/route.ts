import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { mood, sleep, journal } = body;

  const entry = await prisma.entry.create({
    data: {
      moodScore: mood,
      sleepHours: sleep ? parseFloat(sleep) : null,
      journalText: journal || null,
    },
  });

  return NextResponse.json(entry);
}

export async function GET() {
  const entries = await prisma.entry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}