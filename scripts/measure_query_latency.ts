import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function time<T>(label: string, fn: () => Promise<T>) {
  const t0 = performance.now();
  const result = await fn();
  const ms = (performance.now() - t0).toFixed(0);
  console.log(`  ${ms.padStart(6)} ms  ${label}`);
  return result;
}

async function main() {
  console.log('Row counts:');
  const [emp, tr] = await Promise.all([
    prisma.employee.count(),
    prisma.trainingRecord.count(),
  ]);
  console.log(`  employees: ${emp}`);
  console.log(`  training records: ${tr}`);

  console.log('\nQuery latencies (cold, single process):');
  await time('SELECT 1 (round-trip baseline)', () => prisma.$queryRaw`SELECT 1`);
  await time('findMany employee (no relations)', () => prisma.employee.findMany());
  await time('findMany employee + trainingRecords include (what /api/employees does)', () =>
    prisma.employee.findMany({
      include: {
        trainingRecords: {
          select: {
            id: true,
            trainingType: true,
            content: true,
            totalHour: true,
            startDate: true,
            endDate: true,
            organizer: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
  );
  await time('findMany trainingRecord + employees include (what /api/training does)', () =>
    prisma.trainingRecord.findMany({
      include: {
        employees: { select: { id: true, fullName: true } },
      },
      orderBy: { trainingIndex: 'asc' },
    }),
  );

  console.log('\nWarm-connection retries (second call should be much faster):');
  await time('SELECT 1 (2nd)', () => prisma.$queryRaw`SELECT 1`);
  await time('findMany employee (2nd)', () => prisma.employee.findMany());
}

main().finally(() => prisma.$disconnect());
