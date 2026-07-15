import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const [carlos, camila, melissa] = await Promise.all([
    prisma.user.create({
      data: { name: 'Carlos', email: 'carlos@example.com', passwordHash: password, color: '#7C3AED' },
    }),
    prisma.user.create({
      data: { name: 'Camila', email: 'camila@example.com', passwordHash: password, color: '#2563EB' },
    }),
    prisma.user.create({
      data: { name: 'Melissa', email: 'melissa@example.com', passwordHash: password, color: '#059669' },
    }),
  ]);

  await prisma.task.createMany({
    data: [
      {
        title: 'Recoger bouquet y botonier en 171 Mont Royal Ave E',
        status: 'PENDING',
        priority: 'HIGH',
        assigneeId: carlos.id,
      },
      {
        title: 'Recibir y armar la carpa',
        status: 'PENDING',
        priority: 'HIGH',
        assigneeId: melissa.id,
      },
    ],
  });

  console.log('Seed complete: 3 users (Carlos, Camila, Melissa), 2 tasks.');
  console.log('Login: carlos@example.com | camila@example.com | melissa@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
