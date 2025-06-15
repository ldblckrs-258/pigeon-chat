const mediaService = require('../services/media.service')
const iceServersUtil = require('../utils/iceServers.util')
const fs = require('fs')

/**
 * Uploads an image file to cloud storage.
 * @param {Object} req - Express request object
 * @param {Object} req.file - Uploaded file object from multer middleware
 * @param {string} req.file.path - Local path to the uploaded file
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    const filePath = req.file?.path
    if (!filePath) {
      return res.status(400).send({ message: 'No image found' })
    }
    const result = await mediaService.upload(filePath)

    fs.unlink(filePath, err => {
      if (err) {
        console.error(err)
      }
    })
    res.status(201).send({
      message: 'Image uploaded successfully',
      url: result.secure_url,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

/**
 * Retrieves ICE servers configuration for WebRTC connections.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string[]} req.query.types - Array of ICE server types to include (free, metered, cloudflare, private, all)
 * @param {Object} res - Express response object
 */
const getIceServers = async (req, res) => {
  const types = req.query.types
  try {
    let iceServers = []
    if (types.includes('all')) {
      iceServers = iceServers.concat(await iceServersUtil.allIceServers())
    } else {
      if (types.includes('free')) {
        iceServers = iceServers.concat(iceServersUtil.freeIceServers)
      }
      if (types.includes('metered')) {
        iceServers = iceServers.concat(await iceServersUtil.meteredIceServers())
      }
      if (types.includes('cloudflare')) {
        iceServers = iceServers.concat(await iceServersUtil.cloudflareIceServers())
      }
      if (types.includes('private')) {
        iceServers = iceServers.concat(await iceServersUtil.privateCloudflareIceServers())
      }
    }

    res.status(200).send(iceServers)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Request failed, please try again later.' })
  }
}

module.exports = { uploadImage, getIceServers }
