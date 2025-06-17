const { z } = require('zod')

const startVoiceCallSchema = z.object({
  body: z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
  }),
})

const endVoiceCallSchema = z.object({
  body: z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
  }),
})

module.exports = {
  startVoiceCallSchema,
}
