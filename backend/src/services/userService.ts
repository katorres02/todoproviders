import { prisma } from '../lib/prisma';

const publicUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  color: true,
  createdAt: true,
  _count: { select: { tasks: true } },
} as const;

export function listUsers() {
  return prisma.user.findMany({ select: publicUser, orderBy: { name: 'asc' } });
}

export function getUser(id: string) {
  return prisma.user.findUniqueOrThrow({ where: { id }, select: publicUser });
}

export function updateUser(id: string, data: { name?: string; phone?: string | null; color?: string }) {
  return prisma.user.update({ where: { id }, data, select: publicUser });
}

export function deleteUser(id: string) {
  return prisma.user.delete({ where: { id }, select: { id: true } });
}
