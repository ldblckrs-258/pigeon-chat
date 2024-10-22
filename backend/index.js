const http = require("http")
const mongoose = require("mongoose")
const socketService = require("./services/socket.service")
const socketio = require("socket.io")
require("dotenv").config()
const app = require("./app")
const port = process.env.PORT || 3001
const server = http.createServer(app)

global._io = socketio(server, socketService.config)
global._onlineUsers = []

global._io.on("connection", socketService.connection)

server.listen(port, () => {
  console.log(`Local: http://localhost:${port}`)
  const addresses = require("./utils/network.util").networkAddresses()
  addresses.forEach((address) => {
    console.log(`Network: http://${address}:${port}`)
  })
})
mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB\n")
  })
  .catch((err) => {
    console.error(err)
  })
