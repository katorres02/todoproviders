import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { conflict, unauthorized } from '../lib/errors';
import { signToken } from '../middleware/auth';

const USER_COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#DB2777', '#0891B2', '#65A30D'];

const publicUser = { id: true, name: true, email: true, phone: true, color: true, createdAt: true } as const;

export async function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  color?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('Email already registered');

  const count = await prisma.user.count();
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      color: input.color ?? USER_COLORS[count % USER_COLORS.length],
      passwordHash: await bcrypt.hash(input.password, 10),
    },
    select: publicUser,
  });
  return { user, token: signToken({ sub: user.id, email: user.email }) };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw unauthorized('Invalid email or password');
  }
  const { passwordHash: _ph, ...safe } = user;
  return { user: safe, token: signToken({ sub: user.id, email: user.email }) };
}

export async function me(userId: string) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: publicUser });
}
