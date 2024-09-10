import ChatRoom, { CHAT_ROOM_TYPES } from '../models/chatRoomModel.js'
import userService from './userService.js'

class ChatRoomService {
  /**
   * Enums for chat room types
   * @readonly
   * @enum {String}
   */

  /**
   * Tạo phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} receiverId - ID người nhận
   * @returns {Object} Thông tin phòng chat
   */
  createChatRoom = async (userId, receiverId) => {
    try {
      const newChatRoom = new ChatRoom({
        type: CHAT_ROOM_TYPES.PRIVATE,
        members: [userId, receiverId],
        owners: [userId, receiverId]
      })
      await newChatRoom.save()
      return newChatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Tạo phòng chat nhóm
   * @param {String} userId - ID người dùng
   * @param {Array} memberIds - Danh sách ID người dùng khác
   * @returns {Object} Thông tin phòng chat
   */
  createGroupChatRoom = async (userId, memberIds) => {
    try {
      const newChatRoom = new ChatRoom({
        type: CHAT_ROOM_TYPES.GROUP,
        members: [userId, ...memberIds],
        owners: [userId],
        name: 'New Group Chat',
        avatar:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFei77t1O-6TTTENh63BsESAoRUaY8ttuxNw&s'
      })
      await newChatRoom.save()
      return newChatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Lấy danh sách phòng chat của người dùng
   * @param {String} userId - ID người dùng
   * @returns {Array} Danh sách phòng chat
   */
  getChatRoomsByUserId = async (userId, type = null) => {
    try {
      const query = { members: userId }

      if (type) query.type = type

      const chatRooms = await ChatRoom.find(query)

      return chatRooms
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Lấy thông tin phòng chat theo ID
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @returns {Object} Thông tin phòng chat
   */
  getChatRoomByRoomId = async (userId, chatRoomId) => {
    try {
      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        members: userId
      })
      return chatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Cập nhật thông tin phòng chat
   * @param {String} chatRoomId - ID phòng chat
   * @param {Object} name - Tên phòng chat
   * @param {Object} avatar - Avatar phòng chat
   * @returns {Object} Thông tin phòng chat
   */
  updateChatRoom = async (chatRoomId, name, avatar) => {
    try {
      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        type: CHAT_ROOM_TYPES.GROUP,
        owners: userId
      })
      if (!chatRoom) return

      if (name) chatRoom.name = name
      if (avatar) chatRoom.avatar = avatar

      await chatRoom.save()
      return chatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Thêm thành viên vào phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @param {Array} memberIds - Danh sách ID người dùng khác
   * @returns {Object} Thông tin phòng chat
   */
  addMemberToChatRoom = async (userId, chatRoomId, memberIds) => {
    try {
      const validUserIds = userService.validateUserIds(memberIds)
      if (!validUserIds) return

      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        type: CHAT_ROOM_TYPES.GROUP,
        owners: userId
      })
      if (!chatRoom) return

      chatRoom.members = Array.from(
        new Set([...chatRoom.members, ...validUserIds])
      )

      await chatRoom.save()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Xóa thành viên khỏi phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   * @param {Array} targetId - ID người dùng cần xóa
   * @returns {Object} Thông tin phòng chat
   */
  removeMemberFromChatRoom = async (userId, chatRoomId, targetId) => {
    try {
      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        type: CHAT_ROOM_TYPES.GROUP,
        owners: userId
      })
      if (!chatRoom) return

      chatRoom.members = chatRoom.members.filter(
        (memberId) => memberId !== targetId
      )

      await chatRoom.save()
      return chatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Xóa phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   */
  deleteChatRoom = async (userId, chatRoomId) => {
    try {
      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        owners: userId
      })
      if (!chatRoom) return

      await chatRoom.remove()

      return chatRoom
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Rời khỏi phòng chat
   * @param {String} userId - ID người dùng
   * @param {String} chatRoomId - ID phòng chat
   */

  leaveChatRoom = async (userId, chatRoomId) => {
    try {
      const chatRoom = await ChatRoom.findOne({
        _id: chatRoomId,
        members: userId
      })
      if (!chatRoom) return

      chatRoom.members = chatRoom.members.filter(
        (memberId) => memberId !== userId
      )

      await chatRoom.save()
      return chatRoom
    } catch (error) {
      console.error(error)
    }
  }
}

export default new ChatRoomService()
