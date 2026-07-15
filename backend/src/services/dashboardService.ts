import { prisma } from '../lib/prisma';
import { PRIORITIES, TASK_STATUSES } from '../validators';

export async function getDashboard() {
  const [tasks, providers, recentComments] = await Promise.all([
    prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, color: true } },
        provider: { select: { id: true, name: true, service: true } },
      },
    }),
    prisma.provider.findMany(),
    prisma.comment.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, color: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  const byStatus = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<string, number>;
  const byPriority = Object.fromEntries(PRIORITIES.map((p) => [p, 0])) as Record<string, number>;
  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
  }

  const now = new Date();
  const upcoming = tasks
    .filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate >= now)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .slice(0, 8);
  const overdue = tasks
    .filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < now)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  const totalContracted = providers.reduce((sum, p) => sum + (p.contracted ?? 0), 0);
  const totalPaid = providers.reduce((sum, p) => sum + (p.paid ?? 0), 0);

  const completed = byStatus.COMPLETED ?? 0;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return {
    weddingDate: process.env.WEDDING_DATE ?? null,
    totals: {
      tasks: tasks.length,
      completed,
      providers: providers.length,
      critical: tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length,
      overdue: overdue.length,
      progress,
    },
    byStatus,
    byPriority,
    payments: {
      totalContracted,
      totalPaid,
      outstanding: totalContracted - totalPaid,
      providers: providers
        .filter((p) => (p.contracted ?? 0) > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          service: p.service,
          contracted: p.contracted ?? 0,
          paid: p.paid ?? 0,
          outstanding: (p.contracted ?? 0) - (p.paid ?? 0),
        }))
        .sort((a, b) => b.outstanding - a.outstanding),
    },
    upcoming,
    overdue: overdue.slice(0, 8),
    recentActivity: recentComments,
  };
}
