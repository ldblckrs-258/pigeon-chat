async function serverInfo(req, res) {
  try {
    // Get server info
    const os = require('os')
    const serverInfo = {
      cpu: os.cpus()[0].model,
      architecture: os.arch(),
      platform: os.platform(),
      upTime: os.uptime() + ' s',
      freeMemory: (os.freemem() / 1024 / 1024).toFixed(2) + ' MB',
      totalMemory: (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB',
    }
    res.send({
      message: 'Server is running',
      info: serverInfo,
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}

function networkAddresses() {
  const os = require('os')
  const networkInterfaces = os.networkInterfaces()
  const addresses = []
  for (const key in networkInterfaces) {
    for (const network of networkInterfaces[key]) {
      if (network.family === 'IPv4' && !network.internal) {
        addresses.push(network.address)
      }
    }
  }
  return addresses
}

module.exports = { serverInfo, networkAddresses }
