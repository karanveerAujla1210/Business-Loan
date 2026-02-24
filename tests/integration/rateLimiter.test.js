const request = require('supertest');
const express = require('express');
const { apiLimiter, authLimiter } = require('../../src/middlewares/rateLimiter');

describe('Rate Limiting Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.get('/api/test', apiLimiter, (req, res) => {
      res.json({ message: 'success' });
    });

    app.post('/api/auth', authLimiter, (req, res) => {
      res.json({ message: 'auth success' });
    });
  });

  describe('API Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/api/test');
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  describe('Auth Rate Limiter', () => {
    it('should allow auth requests within limit', async () => {
      const response = await request(app).post('/api/auth').send({});
      expect(response.status).toBe(200);
    });

    it('should have stricter limits than API limiter', async () => {
      const response = await request(app).post('/api/auth').send({});
      const limit = parseInt(response.headers['ratelimit-limit']);
      expect(limit).toBeLessThan(100);
    });
  });
});
