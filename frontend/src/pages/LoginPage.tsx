import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';

const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isRegister = tab === 1;

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      if (isRegister) await registerUser(values.name!, values.email, values.password);
      else await login(values.email, values.password);
      navigate('/');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: (t) =>
          t.palette.mode === 'light'
            ? 'linear-gradient(160deg, #f5f1ff 0%, #fdf2f8 100%)'
            : 'linear-gradient(160deg, #17111f 0%, #1f1118 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FavoriteIcon color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h5">Wedding Ops</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Gestión colaborativa de tareas, proveedores y pagos de la boda
            </Typography>
          </Stack>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
            <Tab label="Iniciar sesión" />
            <Tab label="Crear cuenta" />
          </Tabs>
          <form onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {isRegister && (
                <TextField
                  label="Nombre"
                  fullWidth
                  {...register('name')}
                  error={Boolean(formState.errors.name)}
                  helperText={formState.errors.name?.message}
                />
              )}
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email')}
                error={Boolean(formState.errors.email)}
                helperText={formState.errors.email?.message}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                {...register('password')}
                error={Boolean(formState.errors.password)}
                helperText={formState.errors.password?.message}
              />
              <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
                {isRegister ? 'Crear cuenta' : 'Entrar'}
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Demo: carlos@example.com / password123
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
