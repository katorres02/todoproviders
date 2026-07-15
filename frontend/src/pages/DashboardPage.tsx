import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentsIcon from '@mui/icons-material/Payments';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { chartColors, statusColor } from '../theme';
import { STATUS_LABELS, daysUntil, formatDate, formatMoney, formatRelative } from '../utils/format';
import { StatusChip, PriorityChip } from '../components/chips';
import { UserAvatar } from '../components/UserAvatar';
import { TASK_STATUSES } from '../types';
import type { ReactNode } from 'react';

function KpiCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            {hint && (
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const weddingDate = data.weddingDate ?? import.meta.env.VITE_WEDDING_DATE ?? null;
  const days = weddingDate ? daysUntil(weddingDate) : null;
  const colors = chartColors(mode);
  const sColors = statusColor(mode);

  const statusData = TASK_STATUSES.map((s) => ({
    name: STATUS_LABELS[s],
    value: data.byStatus[s] ?? 0,
    color: sColors[s],
  })).filter((d) => d.value > 0);

  const paidPct = data.payments.totalContracted
    ? Math.round((data.payments.totalPaid / data.payments.totalContracted) * 100)
    : 0;

  return (
    <Stack spacing={2}>
      {/* Countdown + progress */}
      <Card
        sx={{
          background: (t) =>
            t.palette.mode === 'light'
              ? 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
              : 'linear-gradient(135deg, #4C1D95 0%, #831843 100%)',
          color: '#fff',
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FavoriteIcon />
              <Box>
                <Typography variant="h5">
                  {days !== null && days >= 0 ? `Faltan ${days} días` : 'Fecha de boda no configurada'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {weddingDate ? `Gran día: ${formatDate(weddingDate)}` : 'Configura WEDDING_DATE en el backend'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={data.totals.progress}
                  size={72}
                  thickness={4}
                  sx={{ color: '#fff' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <Typography variant="body2" fontWeight={700}>
                    {data.totals.progress}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 140 }}>
                {data.totals.completed} de {data.totals.tasks} tareas completadas
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <KpiCard
            icon={<ChecklistIcon />}
            label="Tareas totales"
            value={String(data.totals.tasks)}
            hint={`${data.totals.completed} completadas`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard icon={<StorefrontIcon />} label="Proveedores" value={String(data.totals.providers)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard
            icon={<WarningAmberIcon />}
            label="Críticas abiertas"
            value={String(data.totals.critical)}
            hint={`${data.totals.overdue} vencidas`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard
            icon={<PaymentsIcon />}
            label="Saldo pendiente"
            value={formatMoney(data.payments.outstanding)}
            hint={`${paidPct}% pagado`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Status donut */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Tareas por estado" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent sx={{ pt: 0 }}>
              {statusData.length === 0 ? (
                <Typography color="text.secondary">Sin tareas todavía.</Typography>
              ) : (
                <>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="55%"
                          outerRadius="85%"
                          paddingAngle={2}
                          stroke={colors.surface}
                          strokeWidth={2}
                        >
                          {statusData.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: colors.surface,
                            border: `1px solid ${colors.grid}`,
                            borderRadius: 8,
                            color: theme.palette.text.primary,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                    {statusData.map((d) => (
                      <Chip
                        key={d.name}
                        size="small"
                        variant="outlined"
                        label={`${d.name}: ${d.value}`}
                        sx={{ '& .MuiChip-label': { fontWeight: 600 } }}
                        icon={
                          <Box
                            sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, ml: '6px !important' }}
                          />
                        }
                      />
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming tasks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Próximas tareas" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent sx={{ pt: 0 }}>
              {data.upcoming.length === 0 ? (
                <Typography color="text.secondary">Nada próximo. ¡Bien!</Typography>
              ) : (
                <List dense disablePadding>
                  {data.upcoming.map((t) => (
                    <ListItem key={t.id} disableGutters sx={{ alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={t.title}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center" component="span" flexWrap="wrap" useFlexGap>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDate(t.dueDate)}
                            </Typography>
                            <PriorityChip priority={t.priority} />
                          </Stack>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      {t.assignee && <UserAvatar name={t.assignee.name} color={t.assignee.color} size={26} />}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payments summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Resumen de pagos" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Pagado
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatMoney(data.payments.totalPaid)} / {formatMoney(data.payments.totalContracted)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, paidPct)}
                    sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                  />
                </Box>
                {data.payments.providers.slice(0, 5).map((p) => (
                  <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.service}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={p.outstanding > 0 ? 'error.main' : 'success.main'}
                    >
                      {p.outstanding > 0 ? formatMoney(p.outstanding) : 'Liquidado'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent activity */}
      <Card>
        <CardHeader title="Actividad reciente" titleTypographyProps={{ variant: 'h6' }} />
        <CardContent sx={{ pt: 0 }}>
          {data.recentActivity.length === 0 ? (
            <Typography color="text.secondary">Sin actividad todavía.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {data.recentActivity.map((c) => (
                <Stack key={c.id} direction="row" spacing={1.5} alignItems="flex-start">
                  <UserAvatar name={c.user.name} color={c.user.color} size={28} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2">
                      <strong>{c.user.name}</strong> comentó en <strong>{c.task?.title}</strong>{' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatRelative(c.createdAt)}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.text}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Overdue */}
      {data.overdue.length > 0 && (
        <Card sx={{ borderColor: 'error.main' }}>
          <CardHeader
            title="Tareas vencidas"
            titleTypographyProps={{ variant: 'h6', color: 'error' }}
            avatar={<WarningAmberIcon color="error" />}
          />
          <CardContent sx={{ pt: 0 }}>
            <List dense disablePadding>
              {data.overdue.map((t) => (
                <ListItem key={t.id} disableGutters>
                  <ListItemText primary={t.title} secondary={`Venció: ${formatDate(t.dueDate)}`} />
                  <StatusChip status={t.status} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
