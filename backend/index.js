import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDb, disconnectDb } from './src/utils/mongodb.js'
import { config } from 'dotenv'
config()
import handleSocketConnection from './src/socket/socket.js'
import homeRoute from './src/routes/homeRoute.js'
import authRoute from './src/routes/authRoute.js'
import chatRoute from './src/routes/chatRoute.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({ origin: '*', credentials: true }))

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' })
})

app.use('/home', homeRoute)
app.use('/auth', authRoute)
app.use('/chat', chatRoute)

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

handleSocketConnection(io)

server.listen(PORT, async () => {
  try {
    await connectDb()
    console.log(`Server is running on http://localhost:${PORT}`)
  } catch (error) {
    console.error('Server is running failure')
  } finally {
    process.on('SIGINT', async () => {
      await disconnectDb()
      process.exit(0)
    })
  }
})
