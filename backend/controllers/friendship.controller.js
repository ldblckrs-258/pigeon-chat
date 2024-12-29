const friendshipModel = require("../models/friendship.model")
const userModel = require("../models/user.model")

const getFriends = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ""
    const friendships = await friendshipModel
      .find({
        $or: [
          { user1: userId, status: "accepted" },
          { user2: userId, status: "accepted" },
        ],
      })
      .populate({
        path: "user1 user2",
        select: "name avatar email",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })

    const friends = friendships
      .map((f) => [f.user1, f.user2])
      .flat()
      .filter((user) => user && user._id.toString() !== userId.toString())
      .sort((a, b) => a.name.localeCompare(b.name))

    res.status(200).send(friends)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id
    const { friendId } = req.body

    const friendship = await friendshipModel.findOneAndDelete({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
      status: "accepted",
    })
    if (!friendship) {
      return res.status(400).send({ message: "Invalid friend" })
    }

    res.status(200).send({ message: "Friend removed" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ""
    const requests = await friendshipModel
      .find({ user2: userId, status: "pending" })
      .populate({
        path: "user1",
        select: "name avatar email",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })

    res.status(200).send(requests)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ""
    const requests = await friendshipModel
      .find({ user1: userId, status: "pending" })
      .populate({
        path: "user2",
        select: "name avatar email",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })

    res.status(200).send(requests)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const name = req.user.name
    const { friendId } = req.body

    const existingRequest = await friendshipModel.findOne({
      user1: userId,
      user2: friendId,
    })
    if (existingRequest) {
      return res.status(400).send({ message: "Friend request already sent" })
    }

    const existingPending = await friendshipModel.findOne({
      user1: friendId,
      user2: userId,
      status: "pending",
    })

    if (existingPending) {
      existingPending.status = "accepted"
      await existingPending.save()

      _io
        .to(_onlineUsers.find((u) => u.userId === friendId)?.socketId)
        .emit("friendRequestAccepted", name)

      return res.status(200).send({ message: "Friend request accepted" })
    }

    const newRequest = new friendshipModel({ user1: userId, user2: friendId })
    await newRequest.save()

    // Notify the friend
    _io
      .to(_onlineUsers.find((u) => u.userId === friendId)?.socketId)
      .emit("friendRequest", name)

    res.status(200).send({ message: "Friend request sent" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const name = req.user.name
    const { requestId } = req.body

    const request = await friendshipModel.findById(requestId)
    if (!request || request.user2.toString() !== userId.toString()) {
      return res.status(400).send({ message: "Invalid request" })
    }

    request.status = "accepted"
    await request.save()

    // Notify the requester
    _io
      .to(
        _onlineUsers.find((u) => u.userId === request.user1.toString())
          ?.socketId
      )
      .emit("friendRequestAccepted", name)

    res.status(200).send({ message: "Friend request accepted" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const { requestId } = req.body

    const request = await friendshipModel.findOneAndDelete({
      _id: requestId,
      user1: userId,
      status: "pending",
    })
    if (!request) {
      return res.status(400).send({ message: "Invalid request" })
    }

    res.status(200).send({ message: "Friend request deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id
    const { requestId } = req.body

    const request = await friendshipModel.findOneAndDelete({
      _id: requestId,
      user2: userId,
      status: "pending",
    })
    if (!request) {
      return res.status(400).send({ message: "Invalid request" })
    }

    res.status(200).send({ message: "Friend request rejected" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const searchForFriends = async (req, res) => {
  try {
    const userId = req.user._id
    const search = req.query.search || ""

    const friendships = await friendshipModel
      .find({
        $or: [
          { user1: userId, status: "accepted" },
          { user2: userId, status: "accepted" },
        ],
      })
      .populate("user1 user2", "name avatar email")

    const friends = friendships.map((f) =>
      f.user1._id.equals(userId) ? f.user2 : f.user1
    )

    const friendsOfFriends = await friendshipModel
      .find({
        $or: [
          { user1: { $in: friends.map((f) => f._id) }, status: "accepted" },
          { user2: { $in: friends.map((f) => f._id) }, status: "accepted" },
        ],
      })
      .populate({
        path: "user1 user2",
        select: "name avatar email",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })

    let result = friendsOfFriends
      .map((f) => [f.user1, f.user2])
      .flat()
      .filter(
        (user) =>
          user &&
          user._id.toString() !== userId.toString() &&
          !friends.find((f) => f._id.equals(user._id))
      )

    const sentRequest = await friendshipModel
      .find({ user1: userId, status: "pending" })
      .select("user2")

    result = result.filter(
      (user) => !sentRequest.find((r) => r.user2.equals(user._id))
    )

    res.status(200).send(result)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

const searchByEmail = async (req, res) => {
  try {
    const { email } = req.query
    let user = await userModel.findOne({ email }).select("name avatar email")
    if (!user) {
      return res.status(404).send({ message: "User not found" })
    }

    const existFriend = await friendshipModel.findOne({
      $or: [
        { user1: req.user._id, user2: user._id },
        { user1: user._id, user2: req.user._id },
      ],
    })

    if (existFriend) {
      user = { ...user._doc, status: existFriend.status }
    }
    res.status(200).send(user)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: err })
  }
}

module.exports = {
  getFriends,
  removeFriend,
  getFriendRequests,
  getSentRequests,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchForFriends,
  searchByEmail,
}
