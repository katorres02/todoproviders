import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { daysUntil, initials, isOverdue, progressPct } from './format';

describe('progressPct', () => {
  it('returns 0 when there are no tasks', () => {
    expect(progressPct(0, 0)).toBe(0);
  });
  it('rounds to the nearest integer', () => {
    expect(progressPct(1, 3)).toBe(33);
    expect(progressPct(2, 3)).toBe(67);
    expect(progressPct(10, 10)).toBe(100);
  });
});

describe('isOverdue', () => {
  it('is true for a past due date on a non-completed task', () => {
    expect(isOverdue({ dueDate: dayjs().subtract(2, 'day').toISOString(), status: 'PENDING' })).toBe(true);
  });
  it('is false for completed tasks and tasks without a due date', () => {
    expect(isOverdue({ dueDate: dayjs().subtract(2, 'day').toISOString(), status: 'COMPLETED' })).toBe(false);
    expect(isOverdue({ dueDate: null, status: 'PENDING' })).toBe(false);
  });
});

describe('daysUntil', () => {
  it('counts whole days ignoring the time of day', () => {
    expect(daysUntil(dayjs().add(10, 'day').toDate())).toBe(10);
    expect(daysUntil(dayjs().toDate())).toBe(0);
  });
});

describe('initials', () => {
  it('takes the first letters of up to two words', () => {
    expect(initials('María López')).toBe('ML');
    expect(initials('Carlos')).toBe('C');
    expect(initials('Ana Sofía Ruiz')).toBe('AS');
  });
});
