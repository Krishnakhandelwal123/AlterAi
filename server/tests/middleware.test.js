import request from 'supertest';
import app from '../index.js';

describe('middleware behavior', () => {
  it('authenticate blocks missing header', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });

  it('authenticate blocks malformed token', async () => {
    const res = await request(app).get('/api/user/profile').set('Authorization', 'Bearer malformed');
    expect(res.status).toBe(401);
  });

  it('error handler returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/not-found');
    expect(res.status).toBe(404);
  });

  it('rate limiter allows requests under limit', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
