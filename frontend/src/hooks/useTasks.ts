import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/endpoints';
import type { Task, TaskFilters, TaskInput, TaskStatus } from '../types';

const invalidateTaskData = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['tasks'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['providers'] });
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({ queryKey: ['tasks', filters], queryFn: () => tasksApi.list(filters) });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => tasksApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TaskInput>) => tasksApi.create(data),
    onSuccess: () => invalidateTaskData(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskInput> }) => tasksApi.update(id, data),
    onSuccess: (_task, { id }) => {
      invalidateTaskData(qc);
      qc.invalidateQueries({ queryKey: ['tasks', 'detail', id] });
    },
  });
}

/** Optimistic status change used by the Kanban board drag & drop. */
export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: ['tasks'] });
      for (const [key, tasks] of snapshots) {
        if (!Array.isArray(tasks)) continue;
        qc.setQueryData(
          key,
          tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => invalidateTaskData(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => invalidateTaskData(qc),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, text }: { taskId: string; text: string }) => tasksApi.addComment(taskId, text),
    onSuccess: (_c, { taskId }) => {
      qc.invalidateQueries({ queryKey: ['tasks', 'detail', taskId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
