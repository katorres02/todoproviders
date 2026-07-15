import { Chip, useTheme, alpha } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { priorityColor, statusColor } from '../theme';
import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/format';
import type { Priority, TaskStatus } from '../types';

export function StatusChip({ status, size = 'small' }: { status: TaskStatus; size?: 'small' | 'medium' }) {
  const theme = useTheme();
  const color = statusColor(theme.palette.mode)[status];
  return (
    <Chip
      size={size}
      label={STATUS_LABELS[status]}
      sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 600, border: `1px solid ${alpha(color, 0.35)}` }}
    />
  );
}

export function PriorityChip({ priority, size = 'small' }: { priority: Priority; size?: 'small' | 'medium' }) {
  const color = priorityColor[priority];
  return (
    <Chip
      size={size}
      icon={<FlagIcon sx={{ fontSize: 14 }} />}
      label={PRIORITY_LABELS[priority]}
      sx={{
        bgcolor: alpha(color, 0.14),
        color: 'text.primary',
        fontWeight: 600,
        border: `1px solid ${alpha(color, 0.5)}`,
        '& .MuiChip-icon': { color },
      }}
    />
  );
}
