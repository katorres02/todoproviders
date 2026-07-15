import { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { useTasks } from '../hooks/useTasks';
import { priorityColor } from '../theme';
import { STATUS_LABELS, formatDate } from '../utils/format';
import { StatusChip, PriorityChip } from '../components/chips';
import { TaskDetailsDialog } from '../components/TaskDetailsDialog';
import { TaskFormDialog } from '../components/TaskFormDialog';
import type { Task } from '../types';

type View = 'month' | 'agenda';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: tasks = [] } = useTasks();
  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [view, setView] = useState<View>('month');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | undefined>();
  const [editing, setEditing] = useState<Task | null>(null);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = dayjs(t.dueDate).format('YYYY-MM-DD');
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [tasks]);

  // Monday-first grid covering the whole visible month
  const gridDays = useMemo(() => {
    const start = cursor.startOf('month');
    const offset = (start.day() + 6) % 7;
    const first = start.subtract(offset, 'day');
    return Array.from({ length: 42 }, (_, i) => first.add(i, 'day'));
  }, [cursor]);

  const agendaTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate)
        .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
    [tasks],
  );

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <IconButton onClick={() => setCursor((c) => c.subtract(1, 'month'))} aria-label="Mes anterior">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 170, textAlign: 'center', textTransform: 'capitalize' }}>
              {cursor.format('MMMM YYYY')}
            </Typography>
            <IconButton onClick={() => setCursor((c) => c.add(1, 'month'))} aria-label="Mes siguiente">
              <ChevronRightIcon />
            </IconButton>
            <IconButton onClick={() => setCursor(dayjs())} aria-label="Hoy">
              <TodayIcon />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <ToggleButtonGroup size="small" exclusive value={view} onChange={(_e, v) => v && setView(v)}>
              <ToggleButton value="month">Mes</ToggleButton>
              <ToggleButton value="agenda">Agenda</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CardContent>
      </Card>

      {view === 'month' ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {WEEKDAYS.map((d) => (
                <Typography key={d} variant="caption" color="text.secondary" textAlign="center" fontWeight={700}>
                  {d}
                </Typography>
              ))}
              {gridDays.map((day) => {
                const key = day.format('YYYY-MM-DD');
                const dayTasks = tasksByDay.get(key) ?? [];
                const isCurrentMonth = day.month() === cursor.month();
                const isToday = day.isSame(dayjs(), 'day');
                return (
                  <Box
                    key={key}
                    onClick={() => {
                      setNewDate(key);
                      setEditing(null);
                      setFormOpen(true);
                    }}
                    sx={{
                      minHeight: { xs: 56, md: 96 },
                      p: 0.5,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: isToday ? 'primary.main' : 'divider',
                      opacity: isCurrentMonth ? 1 : 0.4,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    <Typography variant="caption" fontWeight={isToday ? 800 : 500} color={isToday ? 'primary' : 'inherit'}>
                      {day.date()}
                    </Typography>
                    <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                      {dayTasks.slice(0, isMobile ? 0 : 3).map((t) => (
                        <Box
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsId(t.id);
                          }}
                          sx={{
                            px: 0.5,
                            py: 0.1,
                            borderRadius: 0.75,
                            fontSize: 11,
                            lineHeight: 1.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            bgcolor: alpha(priorityColor[t.priority], 0.16),
                            borderLeft: `3px solid ${priorityColor[t.priority]}`,
                            textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none',
                          }}
                        >
                          {t.title}
                        </Box>
                      ))}
                      {isMobile && dayTasks.length > 0 && (
                        <Chip size="small" label={dayTasks.length} sx={{ height: 16, fontSize: 10 }} />
                      )}
                      {!isMobile && dayTasks.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayTasks.length - 3} más
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {agendaTasks.map((t) => (
              <ListItemButton key={t.id} onClick={() => setDetailsId(t.id)}>
                <ListItemText
                  primary={t.title}
                  secondary={`${formatDate(t.dueDate)} · ${STATUS_LABELS[t.status]}${t.assignee ? ` · ${t.assignee.name}` : ''}`}
                />
                <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <StatusChip status={t.status} />
                  <PriorityChip priority={t.priority} />
                </Stack>
              </ListItemButton>
            ))}
            {agendaTasks.length === 0 && (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No hay tareas con fecha.
              </Typography>
            )}
          </List>
        </Card>
      )}

      <TaskFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        defaultDueDate={newDate}
      />
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
    </Stack>
  );
}
