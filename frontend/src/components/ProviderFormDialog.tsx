import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCreateProvider, useUpdateProvider } from '../hooks/useProviders';
import { apiErrorMessage } from '../api/client';
import type { Provider } from '../types';

const schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  service: z.string().trim().min(1, 'El servicio es obligatorio').max(200),
  phone: z.string().max(50).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  contracted: z.coerce.number().min(0, 'Debe ser positivo').optional(),
  paid: z.coerce.number().min(0, 'Debe ser positivo').optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  provider?: Provider | null;
}

export function ProviderFormDialog({ open, onClose, provider }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const mutation = provider ? updateProvider : createProvider;

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: provider?.name ?? '',
      service: provider?.service ?? '',
      phone: provider?.phone ?? '',
      email: provider?.email ?? '',
      whatsapp: provider?.whatsapp ?? '',
      address: provider?.address ?? '',
      notes: provider?.notes ?? '',
      contracted: provider?.contracted ?? 0,
      paid: provider?.paid ?? 0,
    });
    mutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      service: values.service,
      phone: values.phone || null,
      email: values.email || null,
      whatsapp: values.whatsapp || null,
      address: values.address || null,
      notes: values.notes || null,
      contracted: values.contracted ?? 0,
      paid: values.paid ?? 0,
    };
    if (provider) await updateProvider.mutateAsync({ id: provider.id, data: payload });
    else await createProvider.mutateAsync(payload);
    onClose();
  });

  const err = (k: keyof FormValues) => ({
    error: Boolean(formState.errors[k]),
    helperText: formState.errors[k]?.message as string | undefined,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{provider ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {mutation.isError && <Alert severity="error">{apiErrorMessage(mutation.error)}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Nombre" autoFocus fullWidth {...register('name')} {...err('name')} />
              <TextField label="Servicio" fullWidth {...register('service')} {...err('service')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Teléfono" fullWidth {...register('phone')} />
              <TextField label="WhatsApp" fullWidth placeholder="+52..." {...register('whatsapp')} />
            </Stack>
            <TextField label="Email" fullWidth {...register('email')} {...err('email')} />
            <TextField label="Dirección" fullWidth {...register('address')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Monto contratado"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
                {...register('contracted')}
                {...err('contracted')}
              />
              <TextField
                label="Monto pagado"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
                {...register('paid')}
                {...err('paid')}
              />
            </Stack>
            <TextField label="Notas" fullWidth multiline minRows={2} {...register('notes')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {provider ? 'Guardar cambios' : 'Crear proveedor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
