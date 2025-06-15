const morgan = require('morgan')
const { getTime } = require('../utils/time.util')
morgan.token('preciseTime', getTime)

const options = [
  ':preciseTime',
  ':method',
  ':url',
  ':status',
  ':response-time ms',
  'from :remote-addr',
]

module.exports = morgan(options.join(' '))
