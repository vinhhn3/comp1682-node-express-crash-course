const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Shop API',
      version: '1.0.0',
      description:
        'The API from the Node/Express crash course. Products are public to read; writes need a bearer token; deletes need the admin role.',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    tags: [
      { name: 'Products', description: 'The catalogue' },
      { name: 'Users', description: 'Registration, login and token rotation' },
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
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '665f1c2ab7d1e0a4f2c9b111' },
            title: { type: 'string', example: 'Aero Mug' },
            category: { type: 'string', example: 'Kitchen' },
            price: { type: 'number', example: 24 },
            description: { type: 'string' },
            stock: { type: 'integer', example: 40 },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['title', 'category', 'price'],
          properties: {
            title: { type: 'string', example: 'Desk Mat' },
            category: { type: 'string', example: 'Desk' },
            price: { type: 'number', minimum: 0, example: 29 },
            description: { type: 'string' },
            stock: { type: 'integer', minimum: 0, example: 10 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
        Tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                status: { type: 'integer' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
