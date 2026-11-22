const { z } = require('zod');

const createProductSchema = z.object({
  title: z
    .string({ error: 'title is required' })
    .trim()
    .min(1, 'title is required')
    .max(120, 'title is too long'),
  category: z
    .string({ error: 'category is required' })
    .trim()
    .min(1, 'category is required')
    .max(60, 'category is too long'),
  price: z
    .number({ error: 'price must be a number' })
    .min(0, 'price cannot be negative'),
  description: z.string().trim().max(1000, 'description is too long').optional(),
  stock: z.number().int().min(0, 'stock cannot be negative').optional(),
});

module.exports = { createProductSchema };
