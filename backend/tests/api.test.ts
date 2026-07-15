import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();
let token = '';
let userId = '';
let providerId = '';
let taskId = '';

const email = `test-${Math.random().toString(36).slice(2)}@example.com`;

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Tester', email, password: 'supersecret1' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(email);
    token = res.body.token;
    userId = res.body.user.id;
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Tester', email, password: 'supersecret1' });
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'supersecret1' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('blocks protected routes without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});

describe('Providers CRUD', () => {
  it('creates a provider', async () => {
    const res = await request(app)
      .post('/api/providers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Venue', service: 'Venue', contracted: 1000, paid: 250 });
    expect(res.status).toBe(201);
    providerId = res.body.id;
  });

  it('lists providers', async () => {
    const res = await request(app).get('/api/providers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some((p: { id: string }) => p.id === providerId)).toBe(true);
  });

  it('updates a provider', async () => {
    const res = await request(app)
      .put(`/api/providers/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ paid: 500 });
    expect(res.status).toBe(200);
    expect(res.body.paid).toBe(500);
  });
});

describe('Tasks CRUD', () => {
  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test task',
        priority: 'HIGH',
        status: 'PENDING',
        assigneeId: userId,
        providerId,
        dueDate: '2026-12-01T00:00:00.000Z',
      });
    expect(res.status).toBe(201);
    expect(res.body.assignee.id).toBe(userId);
    taskId = res.body.id;
  });

  it('rejects an invalid status', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad', status: 'DONE' });
    expect(res.status).toBe(400);
  });

  it('filters tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=PENDING&search=Test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some((t: { id: string }) => t.id === taskId)).toBe(true);
  });

  it('updates task status (kanban move)', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('adds a comment', async () => {
    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Looks good' });
    expect(res.status).toBe(201);
    expect(res.body.user.id).toBe(userId);
  });

  it('deletes the task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
    const gone = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(gone.status).toBe(404);
  });
});

describe('Dashboard', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dash task', status: 'COMPLETED' });
  });

  it('returns aggregated metrics', async () => {
    const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totals.tasks).toBeGreaterThan(0);
    expect(res.body.byStatus).toHaveProperty('PENDING');
    expect(res.body.payments).toHaveProperty('outstanding');
  });
});
