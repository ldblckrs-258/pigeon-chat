const { z } = require('zod')
const validator = require('validator')

/**
 * Schema for getting friends with optional search
 */
const getFriendsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

/**
 * Schema for removing a friend
 */
const removeFriendSchema = z.object({
  body: z.object({
    friendId: z
      .string()
      .min(1, 'Friend ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid friend ID format' }),
  }),
})

/**
 * Schema for getting friend requests with optional search
 */
const getFriendRequestsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

/**
 * Schema for getting sent requests with optional search
 */
const getSentRequestsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

/**
 * Schema for sending a friend request
 */
const sendFriendRequestSchema = z.object({
  body: z.object({
    friendId: z
      .string()
      .min(1, 'Friend ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid friend ID format' }),
  }),
})

/**
 * Schema for accepting a friend request
 */
const acceptFriendRequestSchema = z.object({
  body: z.object({
    requestId: z
      .string()
      .min(1, 'Request ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid request ID format' }),
  }),
})

/**
 * Schema for canceling a friend request
 */
const cancelFriendRequestSchema = z.object({
  body: z.object({
    requestId: z
      .string()
      .min(1, 'Request ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid request ID format' }),
  }),
})

/**
 * Schema for rejecting a friend request
 */
const rejectFriendRequestSchema = z.object({
  body: z.object({
    requestId: z
      .string()
      .min(1, 'Request ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid request ID format' }),
  }),
})

/**
 * Schema for searching friends
 */
const searchForFriendsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

/**
 * Schema for searching by email
 */
const searchByEmailSchema = z.object({
  query: z.object({
    email: z.string().email('Invalid email format'),
  }),
})

module.exports = {
  getFriendsSchema,
  removeFriendSchema,
  getFriendRequestsSchema,
  getSentRequestsSchema,
  sendFriendRequestSchema,
  acceptFriendRequestSchema,
  cancelFriendRequestSchema,
  rejectFriendRequestSchema,
  searchForFriendsSchema,
  searchByEmailSchema,
}
