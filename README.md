# 💍 Wedding Operations Manager

Plataforma colaborativa para gestionar las tareas, proveedores, pagos y responsables de una boda. Construida según la [especificación](./docs) con React + MUI (PWA) en el frontend y Express + Prisma en el backend.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Material UI (MUI) |
| Estado servidor | TanStack Query |
| Formularios | React Hook Form + Zod |
| Fechas | DayJS |
| Kanban | @hello-pangea/dnd (drag & drop) |
| Gráficos | Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| BD desarrollo | SQLite |
| BD producción | PostgreSQL (Supabase / Neon) |
| Auth | JWT (email + contraseña, bcrypt) |
| Tests | Vitest + Supertest |

## Funcionalidades

- **Dashboard**: contador regresivo a la boda, anillo de progreso, KPIs (tareas, críticas, proveedores, saldo), dona de tareas por estado, próximas tareas, tareas vencidas, resumen de pagos y actividad reciente.
- **Tareas**: CRUD completo, tabla con búsqueda, filtros (estado, prioridad, responsable, proveedor), ordenamiento, selección múltiple con acciones masivas (completar / eliminar). En móvil la tabla se convierte en tarjetas.
- **Kanban**: Pendiente | En progreso | Completada con drag & drop y actualización optimista.
- **Calendario**: vista mensual y agenda; clic en un día crea una tarea con esa fecha.
- **Proveedores**: tarjetas con botones de contacto directo (Llamar, WhatsApp, Email), montos contratado/pagado con barra de progreso.
- **Pagos**: KPIs, gráfico pagado vs pendiente por proveedor y tabla de saldos.
- **Comentarios** por tarea (historial con autor y fecha relativa).
- **Autenticación** con registro e inicio de sesión (JWT, 7 días).
- **Modo claro/oscuro** persistente + detección de preferencia del sistema.
- **Mobile-first**: drawer lateral en escritorio, navegación inferior en móvil, objetivos táctiles de 44px.
- **PWA instalable** (manifest + service worker con auto-update).

## Arranque rápido (desarrollo)

Requisitos: Node.js 20+.

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npx prisma db push      # crea la BD SQLite
npm run seed            # datos de ejemplo
npm run dev             # API en http://localhost:4000

# 2. Frontend (otra terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # app en http://localhost:5173 (proxy /api -> :4000)
```

**Usuarios demo** (contraseña `password123`): `carlos@example.com`, `maria@example.com`, `sofia@example.com`.

## Docker Compose

```bash
docker compose up --build
# Frontend: http://localhost:8080  (nginx hace proxy de /api al backend)
# API:      http://localhost:4000
```

La base SQLite persiste en el volumen `db-data`. Para cargar datos de ejemplo dentro del contenedor:

```bash
docker compose exec backend npx tsx prisma/seed.ts
```

> Nota: la imagen de producción no incluye `tsx`; si quieres seed en Docker usa `docker compose run --rm backend sh -c "npm i tsx && npx tsx prisma/seed.ts"` o siembra desde tu máquina apuntando `DATABASE_URL` al volumen.

## Tests

```bash
cd backend && npm test    # 15 tests de API (auth, CRUD, filtros, dashboard) sobre una BD SQLite efímera
cd frontend && npm test   # tests unitarios de utilidades
```

## API REST

Todas las rutas (excepto `/api/auth/*`) requieren `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta `{name, email, password}` |
| POST | `/api/auth/login` | Iniciar sesión → `{user, token}` |
| GET | `/api/auth/me` | Usuario actual |
| GET/PUT/DELETE | `/api/users`, `/api/users/:id` | Usuarios |
| GET/POST/PUT/DELETE | `/api/providers`, `/api/providers/:id` | Proveedores |
| GET/POST/PUT/DELETE | `/api/tasks`, `/api/tasks/:id` | Tareas (filtros: `status`, `priority`, `assigneeId`, `providerId`, `paid`, `search`) |
| POST/DELETE | `/api/tasks/:id/comments[/:commentId]` | Comentarios |
| GET | `/api/dashboard` | Métricas agregadas |
| GET | `/health` | Healthcheck |

Estados: `PENDING`, `IN_PROGRESS`, `COMPLETED`. Prioridades: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

## Estructura

```
backend/
  prisma/           # schema, seed
  src/
    controllers/    # handlers HTTP
    middleware/     # auth JWT, validación Zod, manejo de errores
    routes/         # definición de rutas
    services/       # lógica de negocio + acceso a datos (Prisma)
    validators/     # esquemas Zod
    lib/            # cliente Prisma, errores HTTP
  tests/            # tests de integración (Vitest + Supertest)

frontend/
  src/
    api/            # cliente axios + endpoints tipados
    components/     # diálogos de formulario, chips, avatar, confirmación
    context/        # Auth, modo de color
    hooks/          # hooks de TanStack Query
    layouts/        # layout principal (drawer + bottom nav)
    pages/          # Dashboard, Tareas, Kanban, Calendario, Proveedores, Pagos, Login
    routes/         # rutas protegidas
    theme/          # temas claro/oscuro + paleta de gráficos
    types/          # tipos compartidos de la API
    utils/          # formato de fechas/moneda, progreso (con tests)
```

## Despliegue en producción

1. **Base de datos** — crea un proyecto en [Supabase](https://supabase.com) o [Neon](https://neon.tech) y copia la cadena de conexión PostgreSQL.
2. **Backend (Render)** — servicio web sobre `backend/`:
   - En `prisma/schema.prisma` cambia `provider = "sqlite"` por `"postgresql"` (SQLite no soporta enums de Prisma; los estados ya se validan con Zod, así que no hay más cambios).
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma db push && node dist/index.js` (o usa `prisma migrate deploy` con migraciones)
   - Variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (URL de Vercel), `WEDDING_DATE`.
3. **Frontend (Vercel)** — proyecto sobre `frontend/`:
   - Framework: Vite. Variable `VITE_API_URL` = URL del backend en Render.

## Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example`.

## Decisiones y notas

- **SQLite en desarrollo**: Prisma no soporta `enum` en SQLite, por lo que `status`/`priority` son `String` en el esquema y se validan estrictamente con Zod en la API (mismos valores que la spec).
- **`assigneeId` opcional**: permite tareas sin responsable y borrar usuarios sin perder sus tareas (`onDelete: SetNull`).
- **Extras pendientes** (documentados en la spec como opcionales): login con Google, exportar PDF/Excel, notificaciones push, roles.
