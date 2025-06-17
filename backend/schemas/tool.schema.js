const { z } = require('zod')

/**
 * Schema for uploading image
 */
const uploadImageSchema = z.object({
  file: z.any().refine(file => file?.length > 0, 'Image is required'),
})

module.exports = {
  uploadImageSchema,
}
