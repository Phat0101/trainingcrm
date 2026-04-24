import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const result = await prisma.$queryRaw<Array<{ old: string; new_value: string; count: bigint }>>`
    SELECT
      "trainingType" AS old,
      CASE
        WHEN "trainingType" = 'Sinh hoạt chuyên môn tại Bệnh viện'
          THEN 'Sinh hoạt chuyên môn tại Bệnh viện'
        WHEN "trainingType" = 'Đào tạo liên tục ngoài Bệnh viện'
          THEN 'Sinh hoạt chuyên môn ngoài Bệnh viện'
        WHEN "trainingType" = 'Nghiên cứu khoa học - Sáng kiến'
          THEN 'Tham gia NCKH/ Hội đồng nghiệm thu NCKH'
        ELSE 'Khác'
      END AS new_value,
      COUNT(*)::bigint AS count
    FROM "TrainingRecord"
    GROUP BY old, new_value
    ORDER BY count DESC
  `;
  console.log('Migration preview:');
  for (const row of result) {
    console.log(`  [${row.count}]  "${row.old}"  →  "${row.new_value}"`);
  }
}

main().finally(() => prisma.$disconnect());
