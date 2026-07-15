import { z } from 'zod';

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const prioritySchema = z.enum(PRIORITIES);

const optionalTrimmed = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .transform((v) => (v === '' ? null : v ?? null));

// --- Auth ---
export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  phone: optionalTrimmed,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// --- Users ---
export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: optionalTrimmed.optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

// --- Providers ---
export const providerBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  service: z.string().trim().min(1).max(200),
  phone: optionalTrimmed,
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  whatsapp: optionalTrimmed,
  address: optionalTrimmed,
  notes: z.string().trim().max(2000).optional().nullable(),
  contracted: z.number().min(0).optional().nullable(),
  paid: z.number().min(0).optional().nullable(),
});

export const providerUpdateSchema = providerBodySchema.partial();

// --- Tasks ---
export const taskBodySchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
  status: taskStatusSchema.default('PENDING'),
  priority: prioritySchema.default('MEDIUM'),
  dueDate: z.coerce.date().optional().nullable(),
  paid: z.boolean().default(false),
  assigneeId: z.string().cuid().optional().nullable(),
  providerId: z.string().cuid().optional().nullable(),
});

export const taskUpdateSchema = taskBodySchema.partial();

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  assigneeId: z.string().optional(),
  providerId: z.string().optional(),
  paid: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().max(200).optional(),
});

// --- Comments ---
export const commentBodySchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
