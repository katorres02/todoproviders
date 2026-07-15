import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import EventIcon from '@mui/icons-material/Event';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PaidIcon from '@mui/icons-material/Paid';
import { useAddComment, useTask } from '../hooks/useTasks';
import { StatusChip, PriorityChip } from './chips';
import { UserAvatar } from './UserAvatar';
import { formatDate, formatRelative, isOverdue } from '../utils/format';

interface Props {
  taskId: string | null;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskDetailsDialog({ taskId, onClose, onEdit }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: task } = useTask(taskId);
  const addComment = useAddComment();
  const [text, setText] = useState('');

  const submitComment = async () => {
    if (!taskId || !text.trim()) return;
    await addComment.mutateAsync({ taskId, text: text.trim() });
    setText('');
  };

  return (
    <Dialog open={Boolean(taskId)} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      {task && (
        <>
          <DialogTitle sx={{ pr: 10 }}>
            {task.title}
            <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
              <IconButton onClick={onEdit} aria-label="Editar">
                <EditIcon />
              </IconButton>
              <IconButton onClick={onClose} aria-label="Cerrar">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <StatusChip status={task.status} />
                <PriorityChip priority={task.priority} />
                {task.paid && <Chip size="small" icon={<PaidIcon />} label="Pagado" color="success" variant="outlined" />}
                {isOverdue(task) && <Chip size="small" label="Vencida" color="error" />}
              </Stack>

              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Typography>
              )}

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2">Fecha límite: {formatDate(task.dueDate)}</Typography>
                </Stack>
                {task.provider && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StorefrontIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {task.provider.name} · {task.provider.service}
                    </Typography>
                  </Stack>
                )}
                {task.assignee && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UserAvatar name={task.assignee.name} color={task.assignee.color} size={24} />
                    <Typography variant="body2">{task.assignee.name}</Typography>
                  </Stack>
                )}
              </Stack>

              <Divider />

              <Typography variant="subtitle2">Comentarios ({task.comments?.length ?? 0})</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Escribe un comentario..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void submitComment();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={submitComment}
                  disabled={!text.trim() || addComment.isPending}
                  aria-label="Enviar comentario"
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {task.comments?.map((c) => (
                  <Stack key={c.id} direction="row" spacing={1.5}>
                    <UserAvatar name={c.user.name} color={c.user.color} size={28} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        <strong>{c.user.name}</strong>{' '}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatRelative(c.createdAt)}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {c.text}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
