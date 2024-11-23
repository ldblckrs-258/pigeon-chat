const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const validator = require("validator")
const emailService = require("../services/email.service")
const securePassword = require("secure-random-password")

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

    const token = createToken(user._id)
    await emailService.sendVerificationEmail(user.email, user.name, token)

    res.status(201).send({
      message: "Please check your email to verify your account",
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const resendVerificationEmail = async (req, res) => {
  const user = req.user

  if (user?.isVerified) {
    return res.status(400).send({ message: "Account already verified" })
  }

  try {
    const token = createToken(user._id)
    await emailService.sendVerificationEmail(user.email, user.name, token)

    res.status(200).send({ message: "Verification email sent" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const verify = async (req, res) => {
  const token = req.query.token
  try {
    if (!token) {
      return res.status(400).send({ message: "Token is required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded._id)

    if (!user) {
      return res.status(400).send({ message: "User not found" })
    }

    if (user.isVerified) {
      return res.status(200).send({ message: "Account already verified" })
    }

    user.isVerified = true
    await user.save()

    res.status(200).send({ message: "Account verified successfully" })
  } catch (err) {
    console.error(err)
    res.status(400).send({ message: "Invalid token" })
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
      session: !isRemember,
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
        isVerified: user.isVerified,
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
      isVerified: req.user.isVerified,
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

const googleLogin = async (req, res) => {
  const { access_token, isRemember } = req.body
  if (!access_token) {
    return res.status(401).send({ message: "Unauthorized" })
  }

  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    )
    const payload = await googleRes.json()

    if (!payload?.email) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    let user = await userModel.findOne({ email: payload.email })

    if (!user) {
      const password = securePassword.randomPassword({
        length: 16,
        characters: [
          securePassword.lower,
          securePassword.upper,
          securePassword.digits,
          securePassword.symbols,
        ],
      })

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      const newUser = new userModel({
        name: payload.name,
        email: payload.email,
        password: hash,
        avatar: payload.picture,
        isVerified: true,
      })

      user = await newUser.save()
    }

    const token = createToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      session: !isRemember,
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
        isVerified: true,
      },
    })
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized" })
  }
}

module.exports = {
  register,
  login,
  logout,
  myAccount,
  changePassword,
  updateInfo,
  googleLogin,
  verify,
  resendVerificationEmail,
}
