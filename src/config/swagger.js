const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MiniBusiness Loan CRM API',
      version: '1.0.0',
      description: 'API documentation for MiniBusiness Loan CRM Backend',
      contact: {
        name: 'API Support',
        email: 'dev@minibusinessloan.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.minibusinessloan.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string' },
            api_version: { type: 'string', example: '1.0' },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            message: { type: 'string' },
            timestamp: { type: 'number' },
            environment: { type: 'string' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'string' },
                memory: { type: 'object' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

module.exports = swaggerJsdoc(options);
