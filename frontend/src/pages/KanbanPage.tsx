import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Fab,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import { useMoveTask, useTasks } from '../hooks/useTasks';
import { statusColor } from '../theme';
import { STATUS_LABELS, formatDate, isOverdue } from '../utils/format';
import { PriorityChip } from '../components/chips';
import { UserAvatar } from '../components/UserAvatar';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { TaskDetailsDialog } from '../components/TaskDetailsDialog';
import { TASK_STATUSES, type Task, type TaskStatus } from '../types';

export function KanbanPage() {
  const theme = useTheme();
  const { data: tasks = [] } = useTasks();
  const moveTask = useMoveTask();
  const sColors = statusColor(theme.palette.mode);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('PENDING');
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { PENDING: [], IN_PROGRESS: [], COMPLETED: [] };
    for (const t of tasks) map[t.status]?.push(t);
    return map;
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.status === newStatus) return;
    moveTask.mutate({ id: draggableId, status: newStatus });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {TASK_STATUSES.map((status) => (
            <Box key={status}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, px: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: sColors[status] }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  {STATUS_LABELS[status]}
                </Typography>
                <Chip size="small" label={columns[status].length} />
                <Box sx={{ flex: 1 }} />
                <IconButton
                  size="small"
                  aria-label={`Agregar a ${STATUS_LABELS[status]}`}
                  onClick={() => {
                    setEditing(null);
                    setDefaultStatus(status);
                    setFormOpen(true);
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <Stack
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    spacing={1.5}
                    sx={{
                      minHeight: 120,
                      p: 1,
                      borderRadius: 2,
                      transition: 'background-color 150ms ease',
                      bgcolor: snapshot.isDraggingOver
                        ? alpha(sColors[status], 0.10)
                        : alpha(theme.palette.text.primary, 0.03),
                    }}
                  >
                    {columns[status].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <Card
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onClick={() => setDetailsId(task.id)}
                            sx={{
                              cursor: 'grab',
                              boxShadow: dragSnapshot.isDragging ? 6 : 0,
                              transform: dragSnapshot.isDragging ? 'rotate(1deg)' : undefined,
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Stack spacing={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {task.title}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <PriorityChip priority={task.priority} />
                                  {(task._count?.comments ?? 0) > 0 && (
                                    <Chip size="small" icon={<CommentIcon />} label={task._count!.comments} variant="outlined" />
                                  )}
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography
                                    variant="caption"
                                    color={isOverdue(task) ? 'error.main' : 'text.secondary'}
                                  >
                                    {task.dueDate ? formatDate(task.dueDate) : ''}
                                  </Typography>
                                  {task.assignee && (
                                    <UserAvatar name={task.assignee.name} color={task.assignee.color} size={24} />
                                  )}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>

      <Fab
        color="primary"
        aria-label="Nueva tarea"
        onClick={() => {
          setEditing(null);
          setDefaultStatus('PENDING');
          setFormOpen(true);
        }}
        sx={{ position: 'fixed', right: 20, bottom: { xs: 76, md: 24 } }}
      >
        <AddIcon />
      </Fab>

      <TaskFormDialog open={formOpen} onClose={() => setFormOpen(false)} task={editing} defaultStatus={defaultStatus} />
      <TaskDetailsDialog
        taskId={detailsId}
        onClose={() => setDetailsId(null)}
        onEdit={() => {
          const t = tasks.find((x) => x.id === detailsId);
          if (t) {
            setEditing(t);
            setDetailsId(null);
            setFormOpen(true);
          }
        }}
      />
    </>
  );
}
