import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const tagOptions = ["work", "social", "health", "family", "sleep", "exercise"];
const journalSnippets = [
  "Feeling okay today, nothing special.",
  "Really good day, got a lot done.",
  "Tired but managed to push through.",
  "Stressful day at work.",
  "Had a nice time with friends.",
  "Not feeling great, need more rest.",
  "Productive and focused today.",
  "A bit anxious about upcoming deadlines.",
  "Calm and relaxed evening.",
  "",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTags() {
  const count = randomInt(0, 3);
  const shuffled = [...tagOptions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  const email = "seed@example.com";
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password },
  });

  console.log(`Seeding entries for ${user.email}...`);

  const daysBack = 90;
  const entries = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Skip some days randomly, like a real user would
    if (Math.random() < 0.15) continue;

    const sleepHours = randomInt(4, 9);
    // Mood loosely correlated with sleep, plus randomness
    const moodBase = Math.min(10, Math.max(1, Math.round(sleepHours * 0.8 + randomInt(-2, 2))));

    entries.push({
      moodScore: moodBase,
      sleepHours,
      journalText: journalSnippets[randomInt(0, journalSnippets.length - 1)] || null,
      tags: randomTags(),
      userId: user.id,
      createdAt: date,
    });
  }

  await prisma.entry.deleteMany({ where: { userId: user.id } });
  await prisma.entry.createMany({ data: entries });

  console.log(`Created ${entries.length} entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });