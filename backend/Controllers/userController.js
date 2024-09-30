const userModel = require("../Models/userModel")

const getUser = async (req, res) => {
  try {
    const userId = req.query.id
    const user = await userModel.findById(userId).select("-password")

    if (!user) {
      return res.status(400).send({ message: "User not found" })
    }

    res.status(200).send(user)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const findUserByEmail = async (req, res) => {
  try {
    const email = req.query.email
    const user = await userModel
      .findOne({ email: email })
      .select("_id name avatar")

    if (!user) {
      return res.status(404).send({ message: "User not found" })
    }

    res.status(200).send({
      message: "User found",
      user: user,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const getUsers = async (req, res) => {
  const search = req.query.search || ""
  try {
    const users = await userModel
      .find({
        $or: [{ name: { $regex: search, $options: "i" } }, { email: search }],
      })
      .select("_id name avatar email")

    if (!users || users.length === 0) {
      return res.status(404).send({ message: "No users found" })
    }

    res.status(200).send(users)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

module.exports = { getUser, getUsers, findUserByEmail }
