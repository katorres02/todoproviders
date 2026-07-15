import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  commentBodySchema,
  loginSchema,
  providerBodySchema,
  providerUpdateSchema,
  registerSchema,
  taskBodySchema,
  taskQuerySchema,
  taskUpdateSchema,
  updateUserSchema,
} from '../validators';
import * as auth from '../controllers/authController';
import * as users from '../controllers/userController';
import * as providers from '../controllers/providerController';
import * as tasks from '../controllers/taskController';
import * as dashboard from '../controllers/dashboardController';

export const router = Router();

// Public
router.post('/auth/register', validateBody(registerSchema), auth.register);
router.post('/auth/login', validateBody(loginSchema), auth.login);

// Protected
router.use(requireAuth);

router.get('/auth/me', auth.me);

router.get('/users', users.list);
router.get('/users/:id', users.get);
router.put('/users/:id', validateBody(updateUserSchema), users.update);
router.delete('/users/:id', users.remove);

router.get('/providers', providers.list);
router.get('/providers/:id', providers.get);
router.post('/providers', validateBody(providerBodySchema), providers.create);
router.put('/providers/:id', validateBody(providerUpdateSchema), providers.update);
router.delete('/providers/:id', providers.remove);

router.get('/tasks', validateQuery(taskQuerySchema), tasks.list);
router.get('/tasks/:id', tasks.get);
router.post('/tasks', validateBody(taskBodySchema), tasks.create);
router.put('/tasks/:id', validateBody(taskUpdateSchema), tasks.update);
router.delete('/tasks/:id', tasks.remove);
router.post('/tasks/:id/comments', validateBody(commentBodySchema), tasks.addComment);
router.delete('/tasks/:id/comments/:commentId', tasks.removeComment);

router.get('/dashboard', dashboard.get);
