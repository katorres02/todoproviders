import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Priority, TaskStatus } from '../types';

dayjs.extend(relativeTime);
dayjs.locale('es');

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export const formatMoney = (value: number | null | undefined) => currency.format(value ?? 0);

export const formatDate = (value: string | Date | null | undefined) =>
  value ? dayjs(value).format('D MMM YYYY') : '—';

export const formatRelative = (value: string | Date) => dayjs(value).fromNow();

export const isOverdue = (task: { dueDate?: string | null; status: TaskStatus }) =>
  Boolean(task.dueDate && task.status !== 'COMPLETED' && dayjs(task.dueDate).isBefore(dayjs(), 'day'));

/** Completed / total, as an integer percentage. Empty input -> 0. */
export const progressPct = (completed: number, total: number) =>
  total <= 0 ? 0 : Math.round((completed / total) * 100);

/** Whole days from today until the given date (negative if past). */
export const daysUntil = (date: string | Date) => dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
