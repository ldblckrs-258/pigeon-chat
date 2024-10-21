const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

const authenticate = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).send({ message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const detectedUser = await userModel.findById(decoded._id)

    if (!detectedUser) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    req.user = detectedUser
    next()
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

module.exports = authenticate
