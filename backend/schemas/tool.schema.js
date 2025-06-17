const { z } = require('zod')

/**
 * Schema for uploading image
 */
const uploadImageSchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image is required'),
  }),
})

module.exports = {
  uploadImageSchema,
}
