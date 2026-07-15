import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/endpoints';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get, refetchInterval: 60_000 });
}
