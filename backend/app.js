const express = require('express')
require('express-async-errors') // Enable automatic async error handling
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

const { serverInfo } = require('./utils/network.util')

const notFound = require('./middlewares/notFound.middleware')
const globalErrorHandler = require('./middlewares/errorHandler.middleware')
const securityMiddleware = require('./middlewares/security.middleware')
const { generalLimiter } = require('./middlewares/rateLimiter.middleware')

const app = express()

// Security middleware
app.use(securityMiddleware)

// Rate limiting
app.use(generalLimiter)

app.use(require('./middlewares/morgan.middleware'))
app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: process.env.ORIGIN || 'http://localhost:3000',
  })
)

// Routes
app.get('/', serverInfo)
app.use(require('./routes'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.all('*', notFound)
app.use(globalErrorHandler)

module.exports = app
