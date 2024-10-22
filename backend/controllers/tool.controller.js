const mediaService = require("../services/media.service")
const fs = require("fs")

const uploadImage = async (req, res) => {
  try {
    const filePath = req.file?.path
    if (!filePath) {
      return res.status(400).send({ message: "No image found" })
    }
    const result = await mediaService.upload(filePath)

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err)
      }
    })
    res.status(201).send({
      message: "Image uploaded successfully",
      url: result.secure_url,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Request failed, please try again later." })
  }
}

module.exports = { uploadImage }
