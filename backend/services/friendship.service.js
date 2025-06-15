const friendshipModel = require('../models/friendship.model')
const userModel = require('../models/user.model')
const { createNotFoundError, createConflictError } = require('../utils/errorTypes')

class FriendshipService {
  /**
   * Get friends of a user with optional search functionality
   */
  async getFriends(userId, search = '') {
    const friendships = await friendshipModel
      .find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' },
        ],
      })
      .populate({
        path: 'user1 user2',
        select: 'name avatar email',
        match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
      })

    const friends = friendships
      .map(f => [f.user1, f.user2])
      .flat()
      .filter(user => user && user._id.toString() !== userId.toString())
      .sort((a, b) => a.name.localeCompare(b.name))

    return friends
  }

  /**
   * Remove a friend from the user's friend list
   */
  async removeFriend(userId, friendId) {
    const friendship = await friendshipModel.findOneAndDelete({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
      status: 'accepted',
    })

    if (!friendship) {
      throw createNotFoundError('Invalid friend')
    }

    return friendship
  }

  /**
   * Get pending friend requests received by the user
   */
  async getFriendRequests(userId, search = '') {
    const requests = await friendshipModel.find({ user2: userId, status: 'pending' }).populate({
      path: 'user1',
      select: 'name avatar email',
      match: {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      },
    })

    return requests
  }

  /**
   * Get sent friend requests by the user
   */
  async getSentRequests(userId, search = '') {
    const requests = await friendshipModel.find({ user1: userId, status: 'pending' }).populate({
      path: 'user2',
      select: 'name avatar email',
      match: {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      },
    })

    return requests
  }

  /**
   * Send a friend request to another user
   */
  async sendFriendRequest(userId, friendId) {
    // Check if request already exists
    const existingRequest = await friendshipModel.findOne({
      user1: userId,
      user2: friendId,
    })

    if (existingRequest) {
      throw createConflictError('Friend request already sent')
    }

    // Check if there's a pending request from the other user
    const existingPending = await friendshipModel.findOne({
      user1: friendId,
      user2: userId,
      status: 'pending',
    })

    if (existingPending) {
      // Auto-accept the request
      existingPending.status = 'accepted'
      await existingPending.save()
      return { type: 'auto-accepted', friendship: existingPending }
    }

    // Create new request
    const newRequest = new friendshipModel({ user1: userId, user2: friendId })
    await newRequest.save()

    return { type: 'sent', friendship: newRequest }
  }

  /**
   * Accept a friend request from another user
   */
  async acceptFriendRequest(userId, requestId) {
    const request = await friendshipModel.findById(requestId)

    if (!request || request.user2.toString() !== userId.toString()) {
      throw createNotFoundError('Invalid request')
    }

    request.status = 'accepted'
    await request.save()

    return request
  }

  /**
   * Cancel a sent friend request
   */
  async cancelFriendRequest(userId, requestId) {
    const request = await friendshipModel.findOneAndDelete({
      _id: requestId,
      user1: userId,
      status: 'pending',
    })

    if (!request) {
      throw createNotFoundError('Invalid request')
    }

    return request
  }

  /**
   * Reject a friend request received by the user
   */
  async rejectFriendRequest(userId, requestId) {
    const request = await friendshipModel.findOneAndDelete({
      _id: requestId,
      user2: userId,
      status: 'pending',
    })

    if (!request) {
      throw createNotFoundError('Invalid request')
    }

    return request
  }

  /**
   * Search for friends of friends based on the user's current friends
   */
  async searchForFriends(userId, search = '') {
    // Get current friends
    const friendships = await friendshipModel
      .find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' },
        ],
      })
      .populate('user1 user2', 'name avatar email')

    const friends = friendships.map(f => (f.user1._id.equals(userId) ? f.user2 : f.user1))

    // Get friends of friends
    const friendsOfFriends = await friendshipModel
      .find({
        $or: [
          { user1: { $in: friends.map(f => f._id) }, status: 'accepted' },
          { user2: { $in: friends.map(f => f._id) }, status: 'accepted' },
        ],
      })
      .populate({
        path: 'user1 user2',
        select: 'name avatar email',
        match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
      })

    let result = friendsOfFriends
      .map(f => [f.user1, f.user2])
      .flat()
      .filter(
        user =>
          user &&
          user._id.toString() !== userId.toString() &&
          !friends.find(f => f._id.equals(user._id))
      )

    // Filter out users who already have pending requests
    const sentRequests = await friendshipModel
      .find({ user1: userId, status: 'pending' })
      .select('user2')

    result = result.filter(user => !sentRequests.find(r => r.user2.equals(user._id)))

    return result
  }

  /**
   * Search for a user by email
   */
  async searchByEmail(userId, email) {
    let user = await userModel.findOne({ email }).select('name avatar email')

    if (!user) {
      throw createNotFoundError('User not found')
    }

    // Check existing friendship
    const existingFriend = await friendshipModel.findOne({
      $or: [
        { user1: userId, user2: user._id },
        { user1: user._id, user2: userId },
      ],
    })

    if (existingFriend) {
      user = { ...user._doc, status: existingFriend.status }
    }

    return user
  }

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(userId, targetId) {
    const friendship = await friendshipModel.findOne({
      $or: [
        { user1: userId, user2: targetId },
        { user1: targetId, user2: userId },
      ],
    })

    if (!friendship) {
      return { status: 'none' }
    }

    return {
      status: friendship.status,
      friendship: friendship,
      isRequester: friendship.user1.toString() === userId.toString(),
    }
  }
}

module.exports = new FriendshipService()
