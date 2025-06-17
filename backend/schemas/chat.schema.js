const { z } = require('zod')
const validator = require('validator')

/**
 * Schema for creating a chat
 */
const createChatSchema = z.object({
  body: z.object({
    members: z
      .array(
        z.string().refine(id => validator.isMongoId(id), { message: 'Invalid member ID format' })
      )
      .min(1, 'At least one member is required')
      .max(100, 'Too many members'),
  }),
})

/**
 * Schema for finding user chats with optional search
 */
const findUserChatsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
})

/**
 * Schema for getting a specific chat
 */
const getChatSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
})

/**
 * Schema for adding members to chat
 */
const addMembersSchema = z.object({
  body: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
    members: z
      .array(
        z.string().refine(id => validator.isMongoId(id), { message: 'Invalid member ID format' })
      )
      .min(1, 'At least one member is required')
      .max(50, 'Too many members to add'),
  }),
})

/**
 * Schema for leaving a chat
 */
const leaveChatSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
})

/**
 * Schema for removing a chat member
 */
const removeChatMemberSchema = z.object({
  body: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
    memberId: z
      .string()
      .min(1, 'Member ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid member ID format' }),
  }),
})

/**
 * Schema for deleting a chat
 */
const deleteChatSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
})

/**
 * Schema for editing chat information
 */
const editChatSchema = z.object({
  body: z
    .object({
      chatId: z
        .string()
        .min(1, 'Chat ID is required')
        .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
      name: z.string().min(1, 'Chat name is required').max(100, 'Chat name is too long').optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
    })
    .refine(data => data.name || data.avatar, {
      message: 'At least one field (name or avatar) must be provided',
    }),
})

module.exports = {
  createChatSchema,
  findUserChatsSchema,
  getChatSchema,
  addMembersSchema,
  leaveChatSchema,
  removeChatMemberSchema,
  deleteChatSchema,
  editChatSchema,
}
