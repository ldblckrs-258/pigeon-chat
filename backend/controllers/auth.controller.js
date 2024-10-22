const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const createToken = (_id, session = true) => {
  const secret = process.env.JWT_SECRET

  return jwt.sign({ _id }, secret, {
    expiresIn: session ? "1d" : "30d",
  })
}

const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    let user = await userModel.findOne({ email })

    if (user) {
      return res.status(400).send({ message: "User already exists" })
    }

    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required" })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({ message: "Invalid email" })
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).send({
        message: "Password is not strong enough",
        requirements: [
          "At least 8 characters",
          "At least 1 lowercase letter",
          "At least 1 uppercase letter",
          "At least 1 number",
          "At least 1 symbol",
        ],
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    user = new userModel({
      name,
      email,
      password: hash,
    })

    await user.save()

    res.status(201).send({
      message: "User created successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const login = async (req, res) => {
  const { email, password, isRemember } = req.body

  try {
    let user = await userModel.findOne({ email })

    if (!user) {
      return res.status(400).send({ message: "This email is not registered" })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(400).send({ message: "Invalid password" })
    }

    const token = createToken(user._id, !isRemember)

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      session: !isRemember,
      sameSite: 'None',
      ...(isRemember && { maxAge: 30 * 24 * 60 * 60 * 1000 }),
    })

    res.status(200).send({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const logout = (req, res) => {
  res.clearCookie("token")
  res.status(200).send({ message: "Logged out successfully" })
}

const myAccount = (req, res) => {
  res.status(200).send({
    message: "Authenticated successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      email: req.user.email,
      role: req.user.role,
    },
  })
}

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  try {
    const user = req.user
    const validPassword = await bcrypt.compare(oldPassword, user.password)

    if (!validPassword) {
      return res.status(400).send({ message: "Old password is incorrect" })
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).send({
        message: "Password is not strong enough",
        requirements: [
          "At least 8 characters",
          "At least 1 lowercase letter",
          "At least 1 uppercase letter",
          "At least 1 number",
          "At least 1 symbol",
        ],
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)

    user.password = hash
    await user.save()

    res.status(200).send({ message: "Password changed successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err.message })
  }
}

const updateInfo = async (req, res) => {
  const { name, avatar } = req.body

  try {
    const user = req.user
    user.name = name || user.name
    user.avatar = avatar || user.avatar

    await user.save()

    res.status(200).send({ message: "Information updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

module.exports = {
  register,
  login,
  logout,
  myAccount,
  changePassword,
  updateInfo,
}
