const { z } = require('zod')
const validator = require('validator')

/**
 * Schema for creating a message
 */
const createMessageSchema = z.object({
  body: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
    content: z
      .string()
      .min(1, 'Message content is required')
      .max(5000, 'Message content is too long'),
    type: z
      .enum(['text', 'image', 'system', 'emoji', 'fileTransfer', 'voiceCall', 'videoCall', 'file'])
      .default('text'),
  }),
})

/**
 * Schema for getting chat messages
 */
const getChatMessagesSchema = z.object({
  params: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
  query: z.object({
    skip: z.string().regex(/^\d+$/, 'Skip must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  }),
})

/**
 * Schema for getting new messages
 */
const getNewMessagesSchema = z.object({
  params: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
  query: z.object({
    lastMessageId: z
      .string()
      .min(1, 'Last message ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid message ID format' }),
  }),
})

/**
 * Schema for deleting a message
 */
const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z
      .string()
      .min(1, 'Message ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid message ID format' }),
  }),
})

/**
 * Schema for creating file transfer history
 */
const createFileTransferHistorySchema = z.object({
  body: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
    fileName: z.string().min(1, 'File name is required').max(255, 'File name is too long'),
    fileSize: z.number().positive('File size must be positive'),
    status: z.enum(['pending', 'completed', 'failed']).default('completed'),
  }),
})

/**
 * Schema for sending file
 */
const sendFileSchema = z.object({
  body: z.object({
    chatId: z
      .string()
      .min(1, 'Chat ID is required')
      .refine(id => validator.isMongoId(id), { message: 'Invalid chat ID format' }),
  }),
})

module.exports = {
  createMessageSchema,
  getChatMessagesSchema,
  getNewMessagesSchema,
  deleteMessageSchema,
  createFileTransferHistorySchema,
  sendFileSchema,
}
