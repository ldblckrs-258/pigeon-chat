import Message, { MESSAGE_TYPES } from '../models/messageModel.js'

class MessageService {
  /**
   * Tạo tin nhắn mới
   * @param {String} chatRoomId - ID phòng chat
   * @param {String} sender - ID người gửi
   * @param {String} content - Nội dung tin nhắn
   * @param {String} type - Loại tin nhắn
   * @returns {Object} Tin nhắn mới
   */
  createMessage = async (
    chatRoomId,
    sender,
    content,
    type = MESSAGE_TYPES.TEXT
  ) => {
    const newMessage = new Message({
      chatRoomId,
      sender,
      content,
      type
    })
    await newMessage.save()
    return newMessage
  }

  /**
   * Tạo lich sử truyền file
   * @param {String} chatRoomId - ID phòng chat
   * @param {String} sender - ID người gửi
   * @param {String} path - Đường dẫn file
   * @param {Number} size - Kích thước file
   * @returns {Object} Tin nhắn mới
   */
  createFileHistory = async (chatRoomId, sender, path, size) => {
    const newMessage = new Message({
      chatRoomId,
      sender,
      type: MESSAGE_TYPES.FILE_HISTORY,
      file: {
        path,
        size
      }
    })
    await newMessage.save()
    return newMessage
  }

  /**
   * Tạo lich sử cuộc gọi thoại
   * @param {String} chatRoomId - ID phòng chat
   * @param {String} sender - ID người gửi
   * @param {Number} duration - Thời lượng cuộc gọi
   * @returns {Object} Tin nhắn mới
   */
  createVoiceHistory = async (chatRoomId, sender, duration) => {
    const newMessage = new Message({
      chatRoomId,
      sender,
      type: MESSAGE_TYPES.VOICE_HISTORY,
      voice_call: {
        duration
      }
    })
    await newMessage.save()
    return newMessage
  }

  /**
   * Lấy danh sách tin nhắn
   * @param {String} chatRoomId - ID phòng chat
   * @param {String} lastMessageId - ID tin nhắn cuối cùng
   * @param {Number} limit - Số lượng tin nhắn
   * @returns {Object} Danh sách tin nhắn và trạng thái cuối cùng
   */
  getMessages = async (chatRoomId, lastMessageId, limit = 20) => {
    const query = {
      chatRoomId
    }
    if (lastMessageId) {
      query._id = { $lt: lastMessageId }
    }
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    const isLastPage = messages.length < limit

    return { messages, isLastPage }
  }

  /**
   * Xóa tin nhắn
   * @param {String} messageId - ID tin nhắn
   * @returns {Object} Tin nhắn đã xóa
   */
  deleteMessage = async (messageId, userId) => {
    return Message.findOneAndDelete({ _id: messageId, sender: userId })
  }

  /**
   * Xóa tất cả tin nhắn trong phòng chat
   * @param {String} chatRoomId - ID phòng chat
   * @returns {Object} Kết quả xóa
   */
  deleteAllMessages = async (chatRoomId) => {
    return Message.deleteMany({ chatRoomId })
  }
}

export default new MessageService()
