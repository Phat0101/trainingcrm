import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const result = await prisma.$queryRaw<Array<{ trainingType: string; count: bigint }>>`
    SELECT "trainingType", COUNT(*)::bigint as count
    FROM "TrainingRecord"
    GROUP BY "trainingType"
    ORDER BY count DESC
  `;
  console.log('Distinct trainingType values:');
  for (const row of result) {
    console.log(`  [${row.count}] ${JSON.stringify(row.trainingType)}`);
  }
  console.log(`\nTotal distinct values: ${result.length}`);
}

main().finally(() => prisma.$disconnect());
