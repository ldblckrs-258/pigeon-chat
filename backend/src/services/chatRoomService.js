import ChatRoom, { CHAT_ROOM_TYPES } from '../models/chatRoomModel.js'
import userService from './userService.js'

class ChatRoomService {
  /**
   * Kiểm tra người dùng có trong phòng chat không
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @returns {Object} Thông tin phòng chat
   * @returns {Boolean} Kết quả kiểm tra
   */
  checkIsMember = async (userId, chatRoomId) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      members: userId
    })
    return chatRoom
  }

  /**
   * Tạo phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} receiverId - ID người nhận
   * @returns {Object} Thông tin phòng chat
   */
  createChatRoom = async (userId, receiverId) => {
    const newChatRoom = new ChatRoom({
      type: CHAT_ROOM_TYPES.PRIVATE,
      members: [userId, receiverId],
      owners: [userId, receiverId]
    })
    await newChatRoom.save()
    return newChatRoom
  }

  /**
   * Tạo phòng chat nhóm
   * @param {String} userId - ID người dùng
   * @param {Array} memberIds - Danh sách ID người dùng khác
   * @returns {Object} Thông tin phòng chat
   */
  createGroupChatRoom = async (userId, memberIds) => {
    const newChatRoom = new ChatRoom({
      type: CHAT_ROOM_TYPES.GROUP,
      members: [userId, ...memberIds],
      owners: [userId],
      name: 'New Group Chat'
    })
    await newChatRoom.save()
    return newChatRoom
  }

  /**
   * Lấy danh sách phòng chat của người dùng
   * @param {String} userId - ID người dùng
   * @returns {Array} Danh sách phòng chat
   */
  getChatRoomsByUserId = async (userId, type = null) => {
    const query = { members: userId }

    if (type) query.type = type

    const chatRooms = await ChatRoom.find(query)

    return chatRooms
  }

  /**
   * Lấy thông tin phòng chat theo ID
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @returns {Object} Thông tin phòng chat
   */
  getChatRoomByRoomId = async (userId, chatRoomId) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      members: userId
    })
    return chatRoom
  }

  /**
   * Cập nhật thông tin phòng chat
   * @param {String} chatRoomId - ID phòng chat
   * @param {Object} name - Tên phòng chat
   * @returns {Object} Thông tin phòng chat
   */
  updateChatRoom = async (userId, chatRoomId, name) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      type: CHAT_ROOM_TYPES.GROUP,
      owners: userId
    })
    if (!chatRoom) return null

    if (name) chatRoom.name = name

    await chatRoom.save()
    return chatRoom
  }

  /**
   * Thêm thành viên vào phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @param {Array} memberIds - Danh sách ID người dùng khác
   * @returns {Object} Thông tin phòng chat
   */
  addMemberToChatRoom = async (userId, chatRoomId, memberIds) => {
    const validUserIds = await userService.validateUserIds(memberIds)
    if (!validUserIds) throw new Error('Invalid user ids')

    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      type: CHAT_ROOM_TYPES.GROUP,
      owners: userId
    })
    if (!chatRoom) return null

    if (chatRoom.members.length + validUserIds.length > 50) {
      throw new Error('Members exceed limit')
    }

    const newMembers = validUserIds.filter(
      (memberId) => !chatRoom.members.includes(memberId)
    )
    chatRoom.members = [...chatRoom.members, ...newMembers]

    await chatRoom.save()
    return chatRoom
  }

  /**
   * Xóa thành viên khỏi phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @param {Array} targetId - ID người dùng cần xóa
   * @returns {Object} Thông tin phòng chat
   */
  removeMemberFromChatRoom = async (userId, chatRoomId, targetId) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      type: CHAT_ROOM_TYPES.GROUP,
      owners: userId
    })
    if (!chatRoom) return null

    chatRoom.members = chatRoom.members.filter(
      (memberId) => !memberId.equals(targetId)
    )

    if (!chatRoom.members.length) {
      await chatRoom.deleteOne()
      return chatRoom
    }

    chatRoom.owners = chatRoom.owners.filter(
      (ownerId) => !ownerId.equals(targetId)
    )
    await chatRoom.save()
    return chatRoom
  }

  /**
   * Xóa phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   */
  deleteChatRoom = async (userId, chatRoomId) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      owners: userId
    })
    if (!chatRoom) return null

    await chatRoom.deleteOne()

    return chatRoom
  }

  /**
   * Rời khỏi phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   */

  leaveChatRoom = async (userId, chatRoomId) => {
    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      type: CHAT_ROOM_TYPES.GROUP,
      members: userId
    })
    if (!chatRoom) return null

    chatRoom.members = chatRoom.members.filter(
      (memberId) => !memberId.equals(userId)
    )

    if (!chatRoom.members.length) {
      await chatRoom.deleteOne()
      return chatRoom
    }

    chatRoom.owners = chatRoom.owners.filter(
      (ownerId) => !ownerId.equals(userId)
    )

    if (!chatRoom.owners.length) {
      chatRoom.owners = [chatRoom.members[0]]
    }

    await chatRoom.save()
    return chatRoom
  }
}

export default new ChatRoomService()
