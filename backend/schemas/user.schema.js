const { z } = require('zod')
const validator = require('validator')

/**
 * Schema for getting user by ID
 */
const getUserSchema = z.object({
  query: z.object({
    id: z
      .string()
      .min(1, 'User ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid user ID format' }),
  }),
})

/**
 * Schema for finding user by email
 */
const findUserByEmailSchema = z.object({
  query: z.object({
    email: z.string().email('Invalid email format'),
  }),
})

/**
 * Schema for getting users with search
 */
const getUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

module.exports = {
  getUserSchema,
  findUserByEmailSchema,
  getUsersSchema,
}
