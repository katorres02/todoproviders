import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { TaskQuery } from '../validators';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, color: true } },
  provider: { select: { id: true, name: true, service: true } },
  _count: { select: { comments: true } },
} as const;

export function listTasks(query: TaskQuery) {
  const where: Prisma.TaskWhereInput = {
    status: query.status,
    priority: query.priority,
    assigneeId: query.assigneeId,
    providerId: query.providerId,
    paid: query.paid,
  };
  if (query.search) {
    where.OR = [{ title: { contains: query.search } }, { description: { contains: query.search } }];
  }
  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export function getTask(id: string) {
  return prisma.task.findUniqueOrThrow({
    where: { id },
    include: {
      ...taskInclude,
      comments: {
        include: { user: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export function createTask(data: Prisma.TaskUncheckedCreateInput) {
  return prisma.task.create({ data, include: taskInclude });
}

export function updateTask(id: string, data: Prisma.TaskUncheckedUpdateInput) {
  return prisma.task.update({ where: { id }, data, include: taskInclude });
}

export function deleteTask(id: string) {
  return prisma.task.delete({ where: { id }, select: { id: true } });
}

export function addComment(taskId: string, userId: string, text: string) {
  return prisma.comment.create({
    data: { taskId, userId, text },
    include: { user: { select: { id: true, name: true, color: true } } },
  });
}

export function deleteComment(id: string) {
  return prisma.comment.delete({ where: { id }, select: { id: true } });
}
