const request = require('supertest');
const express = require('express');
const { healthCheck } = require('../../src/controllers/HealthController');

describe('Health Check Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', healthCheck);
  });

  it('should return 200 and health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('checks');
  });

  it('should include database check', async () => {
    const response = await request(app).get('/health');

    expect(response.body.checks).toHaveProperty('database');
  });

  it('should include memory check', async () => {
    const response = await request(app).get('/health');

    expect(response.body.checks).toHaveProperty('memory');
    expect(response.body.checks.memory).toHaveProperty('rss');
    expect(response.body.checks.memory).toHaveProperty('heapUsed');
  });

  it('should return environment info', async () => {
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('environment');
  });
});
