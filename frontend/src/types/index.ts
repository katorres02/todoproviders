export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const TASK_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  color: string;
  createdAt: string;
  _count?: { tasks: number };
}

export interface Provider {
  id: string;
  name: string;
  service: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  notes?: string | null;
  contracted?: number | null;
  paid?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  tasks?: Task[];
}

export interface Comment {
  id: string;
  text: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'color'>;
  task?: { id: string; title: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  paid: boolean;
  assigneeId?: string | null;
  providerId?: string | null;
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'color'> | null;
  provider?: Pick<Provider, 'id' | 'name' | 'service'> | null;
  comments?: Comment[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  paid?: boolean;
  assigneeId?: string | null;
  providerId?: string | null;
}

export interface ProviderInput {
  name: string;
  service: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  notes?: string | null;
  contracted?: number | null;
  paid?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  providerId?: string;
  paid?: boolean;
  search?: string;
}

export interface PaymentRow {
  id: string;
  name: string;
  service: string;
  contracted: number;
  paid: number;
  outstanding: number;
}

export interface DashboardData {
  weddingDate: string | null;
  totals: {
    tasks: number;
    completed: number;
    providers: number;
    critical: number;
    overdue: number;
    progress: number;
  };
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  payments: {
    totalContracted: number;
    totalPaid: number;
    outstanding: number;
    providers: PaymentRow[];
  };
  upcoming: Task[];
  overdue: Task[];
  recentActivity: Comment[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
