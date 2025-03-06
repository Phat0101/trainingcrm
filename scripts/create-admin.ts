import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a default admin user
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: 'admin123', // In a real app, you should hash this password
      },
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 