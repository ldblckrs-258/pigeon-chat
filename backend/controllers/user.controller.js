const userService = require('../services/user.service')

/**
 * Retrieves user information by user ID.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - User ID to retrieve
 * @param {Object} res - Express response object
 */
const getUser = async (req, res) => {
  try {
    const userId = req.query.id
    const user = await userService.getUserById(userId)
    res.status(200).send(user)
  } catch (err) {
    console.error(err)

    if (err.message === 'User not found') {
      return res.status(400).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to get user' })
  }
}

/**
 * Finds a user by their email address.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.email - Email address to search for
 * @param {Object} res - Express response object
 */
const findUserByEmail = async (req, res) => {
  try {
    const email = req.query.email
    const user = await userService.findUserByEmail(email)

    res.status(200).send({
      message: 'User found',
      user: user,
    })
  } catch (err) {
    console.error(err)

    if (err.message === 'User not found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to find user' })
  }
}

/**
 * Searches for users by name with optional search query.
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.search=''] - Search term to filter users by name
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
  const search = req.query.search || ''

  try {
    const users = await userService.searchUsers(search)
    res.status(200).send(users)
  } catch (err) {
    console.error(err)

    if (err.message === 'No users found') {
      return res.status(404).send({ message: err.message })
    }

    res.status(500).send({ message: err.message || 'Failed to search users' })
  }
}

module.exports = { getUser, getUsers, findUserByEmail }
