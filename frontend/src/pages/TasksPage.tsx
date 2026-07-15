import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import { useDeleteTask, useTasks, useUpdateTask } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { useProviders } from '../hooks/useProviders';
import { StatusChip, PriorityChip } from '../components/chips';
import { UserAvatar } from '../components/UserAvatar';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { TaskDetailsDialog } from '../components/TaskDetailsDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PRIORITY_LABELS, STATUS_LABELS, formatDate, isOverdue } from '../utils/format';
import { PRIORITIES, TASK_STATUSES, type Task } from '../types';

export function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [providerId, setProviderId] = useState('');

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: (status || undefined) as never,
      priority: (priority || undefined) as never,
      assigneeId: assigneeId || undefined,
      providerId: providerId || undefined,
    }),
    [search, status, priority, assigneeId, providerId],
  );

  const { data: tasks = [], isLoading } = useTasks(filters);
  const { data: users = [] } = useUsers();
  const { data: providers = [] } = useProviders();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const openEdit = (task: Task) => {
    setEditing(task);
    setDetailsId(null);
    setFormOpen(true);
  };

  const bulkComplete = async () => {
    await Promise.all(selection.map((id) => updateTask.mutateAsync({ id: String(id), data: { status: 'COMPLETED' } })));
    setSelection([]);
  };

  const bulkDelete = async () => {
    await Promise.all(selection.map((id) => deleteTask.mutateAsync(String(id))));
    setSelection([]);
    setConfirmBulkDelete(false);
  };

  const columns: GridColDef<Task>[] = [
    {
      field: 'title',
      headerName: 'Tarea',
      flex: 2,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Stack sx={{ py: 0.5, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.title}
          </Typography>
          {row.provider && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.provider.name}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
      renderCell: ({ row }) => <StatusChip status={row.status} />,
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 130,
      renderCell: ({ row }) => <PriorityChip priority={row.priority} />,
    },
    {
      field: 'dueDate',
      headerName: 'Fecha límite',
      width: 140,
      valueGetter: (value) => (value ? new Date(value) : null),
      renderCell: ({ row }) => (
        <Typography variant="body2" color={isOverdue(row) ? 'error.main' : 'text.primary'}>
          {formatDate(row.dueDate)}
        </Typography>
      ),
    },
    {
      field: 'assignee',
      headerName: 'Responsable',
      width: 120,
      sortable: false,
      renderCell: ({ row }) =>
        row.assignee ? (
          <UserAvatar name={row.assignee.name} color={row.assignee.color} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: 'paid',
      headerName: 'Pago',
      width: 110,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.paid ? 'Pagado' : 'Pendiente'}
          color={row.paid ? 'success' : 'default'}
          variant={row.paid ? 'filled' : 'outlined'}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      {/* Filters */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="Buscar tareas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 2, minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField size="small" select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ flex: 1, minWidth: 140 }}>
              <MenuItem value="">Todos</MenuItem>
              {TASK_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ flex: 1, minWidth: 140 }}>
              <MenuItem value="">Todas</MenuItem>
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Responsable" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="">Todos</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Proveedor" value={providerId} onChange={(e) => setProviderId(e.target.value)} sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="">Todos</MenuItem>
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {selection.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                {selection.length} seleccionadas
              </Typography>
              <Button size="small" startIcon={<DoneAllIcon />} onClick={bulkComplete}>
                Marcar completadas
              </Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmBulkDelete(true)}>
                Eliminar
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Desktop: DataGrid. Mobile: cards */}
      {isMobile ? (
        <Stack spacing={1.5}>
          {tasks.map((t) => (
            <Card key={t.id} onClick={() => setDetailsId(t.id)} sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography fontWeight={600}>{t.title}</Typography>
                    {t.assignee && <UserAvatar name={t.assignee.name} color={t.assignee.color} size={26} />}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    <StatusChip status={t.status} />
                    <PriorityChip priority={t.priority} />
                    {(t._count?.comments ?? 0) > 0 && (
                      <Chip size="small" icon={<CommentIcon />} label={t._count!.comments} variant="outlined" />
                    )}
                  </Stack>
                  <Typography variant="caption" color={isOverdue(t) ? 'error.main' : 'text.secondary'}>
                    {t.dueDate ? `Fecha límite: ${formatDate(t.dueDate)}` : 'Sin fecha límite'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {!isLoading && tasks.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No hay tareas con estos filtros.
            </Typography>
          )}
        </Stack>
      ) : (
        <Card>
          <Box sx={{ height: 560, width: '100%' }}>
            <DataGrid
              rows={tasks}
              columns={columns}
              loading={isLoading}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selection}
              onRowSelectionModelChange={setSelection}
              onRowClick={({ row }) => setDetailsId(row.id)}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50]}
              sx={{ border: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
            />
          </Box>
        </Card>
      )}

      <Fab
        color="primary"
        aria-label="Nueva tarea"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        sx={{ position: 'fixed', right: 20, bottom: { xs: 76, md: 24 } }}
      >
        <AddIcon />
      </Fab>

      <TaskFormDialog open={formOpen} onClose={() => setFormOpen(false)} task={editing} />
      <TaskDetailsDialog
        taskId={detailsId}
        onClose={() => setDetailsId(null)}
        onEdit={() => {
          const t = tasks.find((x) => x.id === detailsId);
          if (t) openEdit(t);
        }}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title="Eliminar tareas"
        message={`¿Eliminar ${selection.length} tareas? Esta acción no se puede deshacer.`}
        onConfirm={bulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        loading={deleteTask.isPending}
      />
    </Stack>
  );
}
