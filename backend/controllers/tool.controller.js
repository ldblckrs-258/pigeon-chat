const mediaService = require('../services/media.service')
const iceServersUtil = require('../utils/iceServers.util')
const fs = require('fs')
const { StatusCodes } = require('http-status-codes')
const catchAsync = require('../utils/catchAsync')

/**
 * Uploads an image file to cloud storage.
 */
const uploadImage = catchAsync(async (req, res) => {
  const filePath = req.file?.path
  if (!filePath) {
    return res.status(StatusCodes.BAD_REQUEST).send({ status: 'error', message: 'No image found' })
  }
  const result = await mediaService.upload(filePath)

  fs.unlink(filePath, err => {
    if (err) {
      console.error(err)
    }
  })
  res.status(StatusCodes.CREATED).send({
    status: 'success',
    message: 'Image uploaded successfully',
    url: result.secure_url,
  })
})

/**
 * Retrieves ICE servers configuration for WebRTC connections.
 */
const getIceServers = catchAsync(async (req, res) => {
  const types = req.query.types
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

  res.status(StatusCodes.OK).send({ status: 'success', data: iceServers })
})

module.exports = { uploadImage, getIceServers }
