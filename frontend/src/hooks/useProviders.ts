import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { providersApi } from '../api/endpoints';
import type { ProviderInput } from '../types';

export function useProviders() {
  return useQuery({ queryKey: ['providers'], queryFn: providersApi.list });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['providers'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['tasks'] });
  };
}

export function useCreateProvider() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: ProviderInput) => providersApi.create(data), onSuccess: invalidate });
}

export function useUpdateProvider() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProviderInput> }) => providersApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProvider() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => providersApi.remove(id), onSuccess: invalidate });
}
