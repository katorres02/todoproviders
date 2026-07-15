import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlaceIcon from '@mui/icons-material/Place';
import { useDeleteProvider, useProviders } from '../hooks/useProviders';
import { ProviderFormDialog } from '../components/ProviderFormDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatMoney } from '../utils/format';
import type { Provider } from '../types';

export function ProvidersPage() {
  const { data: providers = [], isLoading } = useProviders();
  const deleteProvider = useDeleteProvider();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [deleting, setDeleting] = useState<Provider | null>(null);

  return (
    <>
      {isLoading && <LinearProgress />}
      <Grid container spacing={2}>
        {providers.map((p) => {
          const contracted = p.contracted ?? 0;
          const paid = p.paid ?? 0;
          const pct = contracted > 0 ? Math.min(100, Math.round((paid / contracted) * 100)) : 0;
          return (
            <Grid item xs={12} sm={6} lg={4} key={p.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" noWrap>
                        {p.name}
                      </Typography>
                      <Chip size="small" label={p.service} sx={{ mt: 0.5 }} />
                    </Box>
                    <Stack direction="row">
                      <IconButton
                        size="small"
                        aria-label="Editar"
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" aria-label="Eliminar" color="error" onClick={() => setDeleting(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {p.address && (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                      <PlaceIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {p.address}
                      </Typography>
                    </Stack>
                  )}

                  {contracted > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Pagado {formatMoney(paid)} de {formatMoney(contracted)}
                        </Typography>
                        <Typography variant="caption" fontWeight={700}>
                          {pct}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        color={pct >= 100 ? 'success' : 'primary'}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {p._count?.tasks ?? 0} tareas vinculadas
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, gap: 0.5, flexWrap: 'wrap' }}>
                  {p.phone && (
                    <Button size="small" startIcon={<PhoneIcon />} href={`tel:${p.phone}`}>
                      Llamar
                    </Button>
                  )}
                  {p.whatsapp && (
                    <Button
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      href={`https://wa.me/${p.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener"
                      sx={{ color: '#25D366' }}
                    >
                      WhatsApp
                    </Button>
                  )}
                  {p.email && (
                    <Button size="small" startIcon={<EmailIcon />} href={`mailto:${p.email}`}>
                      Email
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        {!isLoading && providers.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
              Aún no hay proveedores. Crea el primero con el botón +.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Fab
        color="primary"
        aria-label="Nuevo proveedor"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        sx={{ position: 'fixed', right: 20, bottom: { xs: 76, md: 24 } }}
      >
        <AddIcon />
      </Fab>

      <ProviderFormDialog open={formOpen} onClose={() => setFormOpen(false)} provider={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar proveedor"
        message={`¿Eliminar a "${deleting?.name}"? Las tareas vinculadas quedarán sin proveedor.`}
        onConfirm={async () => {
          if (deleting) await deleteProvider.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        onClose={() => setDeleting(null)}
        loading={deleteProvider.isPending}
      />
    </>
  );
}
