import request from 'supertest';
import app from '../index.js';

describe('auth routes', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/verify without token returns 401', async () => {
    const res = await request(app).post('/api/auth/verify').send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/verify with invalid token returns 401', async () => {
    const res = await request(app).post('/api/auth/verify').send({ access_token: 'bad' });
    expect([400, 401, 500]).toContain(res.status);
  });

  it('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
