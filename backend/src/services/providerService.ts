import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const withTaskCount = { _count: { select: { tasks: true } } } as const;

export function listProviders() {
  return prisma.provider.findMany({ include: withTaskCount, orderBy: { name: 'asc' } });
}

export function getProvider(id: string) {
  return prisma.provider.findUniqueOrThrow({
    where: { id },
    include: { tasks: { orderBy: { dueDate: 'asc' } }, ...withTaskCount },
  });
}

export function createProvider(data: Prisma.ProviderUncheckedCreateInput) {
  return prisma.provider.create({ data, include: withTaskCount });
}

export function updateProvider(id: string, data: Prisma.ProviderUncheckedUpdateInput) {
  return prisma.provider.update({ where: { id }, data, include: withTaskCount });
}

export function deleteProvider(id: string) {
  return prisma.provider.delete({ where: { id }, select: { id: true } });
}
