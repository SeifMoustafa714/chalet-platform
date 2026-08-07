import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('[seed-admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed-admin] Admin ${email} already exists — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`[seed-admin] Created admin account for ${email}.`);
}

main()
  .catch((err) => console.error('[seed-admin] Failed:', err))
  .finally(() => prisma.$disconnect());
