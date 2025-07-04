const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
})

/**
 * Uploads a media file to Cloudinary
 */
const upload = async file => {
  const result = await cloudinary.uploader.upload(file, {
    upload_preset: 'dev01d_chatapp',
  })
  return result
}

module.exports = {
  upload,
}
