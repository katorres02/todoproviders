import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { chartColors } from '../theme';
import { formatMoney } from '../utils/format';

export function PaymentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading } = useDashboard();
  const colors = chartColors(theme.palette.mode);

  if (isLoading || !data) return <Skeleton variant="rounded" height={400} />;

  const rows = data.payments.providers;
  const chartData = rows.map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 13)}…` : p.name,
    Pagado: p.paid,
    Pendiente: Math.max(0, p.outstanding),
  }));

  const paidPct = data.payments.totalContracted
    ? Math.round((data.payments.totalPaid / data.payments.totalContracted) * 100)
    : 0;

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {[
          { label: 'Total contratado', value: formatMoney(data.payments.totalContracted) },
          { label: 'Total pagado', value: formatMoney(data.payments.totalPaid), hint: `${paidPct}%` },
          { label: 'Saldo pendiente', value: formatMoney(data.payments.outstanding) },
        ].map((kpi) => (
          <Grid item xs={12} sm={4} key={kpi.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {kpi.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="h5">{kpi.value}</Typography>
                  {kpi.hint && <Chip size="small" label={kpi.hint} color="success" variant="outlined" />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardHeader title="Pagado vs pendiente por proveedor" titleTypographyProps={{ variant: 'h6' }} />
        <CardContent sx={{ pt: 0 }}>
          {chartData.length === 0 ? (
            <Typography color="text.secondary">Agrega montos contratados a tus proveedores para ver el desglose.</Typography>
          ) : (
            <Box sx={{ height: Math.max(260, chartData.length * 48), overflowX: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }} barSize={18}>
                  <CartesianGrid horizontal={false} stroke={colors.grid} />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => formatMoney(v)}
                    tick={{ fill: colors.mutedInk, fontSize: 12 }}
                    stroke={colors.grid}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 90 : 130}
                    tick={{ fill: colors.mutedInk, fontSize: 12 }}
                    stroke={colors.grid}
                  />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    contentStyle={{
                      background: colors.surface,
                      border: `1px solid ${colors.grid}`,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend />
                  <Bar dataKey="Pagado" stackId="a" fill={colors.series1} stroke={colors.surface} strokeWidth={2} />
                  <Bar
                    dataKey="Pendiente"
                    stackId="a"
                    fill={colors.series4}
                    stroke={colors.surface}
                    strokeWidth={2}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Saldos por proveedor" titleTypographyProps={{ variant: 'h6' }} />
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Proveedor</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell align="right">Contratado</TableCell>
                <TableCell align="right">Pagado</TableCell>
                <TableCell align="right">Pendiente</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>{p.service}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(p.contracted)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(p.paid)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                    {formatMoney(p.outstanding)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={p.outstanding <= 0 ? 'Liquidado' : 'Pendiente'}
                      color={p.outstanding <= 0 ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                      Sin datos de pagos todavía.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
