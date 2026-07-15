import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useProviders } from '../hooks/useProviders';
import { apiErrorMessage } from '../api/client';
import { PRIORITIES, TASK_STATUSES, type Task, type TaskStatus } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/format';

const schema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
  paid: z.boolean(),
  assigneeId: z.string().optional(),
  providerId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string;
  defaultProviderId?: string;
}

export function TaskFormDialog({ open, onClose, task, defaultStatus, defaultDueDate, defaultProviderId }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: users = [] } = useUsers();
  const { data: providers = [] } = useProviders();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const mutation = task ? updateTask : createTask;

  const { control, register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: 'PENDING', priority: 'MEDIUM', paid: false },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? defaultStatus ?? 'PENDING',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : defaultDueDate ?? '',
      paid: task?.paid ?? false,
      assigneeId: task?.assigneeId ?? '',
      providerId: task?.providerId ?? defaultProviderId ?? '',
    });
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : null,
      paid: values.paid,
      assigneeId: values.assigneeId || null,
      providerId: values.providerId || null,
    };
    if (task) await updateTask.mutateAsync({ id: task.id, data: payload });
    else await createTask.mutateAsync(payload);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{task ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {mutation.isError && <Alert severity="error">{apiErrorMessage(mutation.error)}</Alert>}
            <TextField
              label="Título"
              autoFocus
              fullWidth
              {...register('title')}
              error={Boolean(formState.errors.title)}
              helperText={formState.errors.title?.message}
            />
            <TextField label="Descripción" fullWidth multiline minRows={2} {...register('description')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField select label="Estado" fullWidth {...field}>
                    {TASK_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField select label="Prioridad" fullWidth {...field}>
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Fecha límite"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('dueDate')}
              />
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <TextField select label="Responsable" fullWidth {...field}>
                    <MenuItem value="">Sin asignar</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <Controller
              name="providerId"
              control={control}
              render={({ field }) => (
                <TextField select label="Proveedor" fullWidth {...field}>
                  <MenuItem value="">Sin proveedor</MenuItem>
                  {providers.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} — {p.service}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="paid"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={field.onChange} />}
                  label="Pagado"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {task ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
