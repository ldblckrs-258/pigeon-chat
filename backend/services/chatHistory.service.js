const messageModel = require("../models/message.model");
const chatModel = require("../models/chat.model");
const messageSocket = require("./socket.services/message");

class ChatHistoryService {
  /**
   * Create a system message in the chat history
   */
  createSystemMessage = async (chat, content) => {
    try {
      const newMessage = new messageModel({
        chatId: chat._id,
        senderId: null,
        content,
        type: "system",
        status: "completed",
        readerIds: [],
      });
      await newMessage.save();
      messageSocket.sendMessage(
        newMessage?._doc,
        chat.members.map((member) => member.toString()),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Create a message in the chat history
   */
  createFileTransferHistory = async (
    chatId,
    sender,
    fileName,
    fileSize,
    status,
  ) => {
    try {
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        console.log("Chat not found !");
        return;
      }
      const newMessage = new messageModel({
        chatId,
        senderId: sender._id,
        content: fileName,
        type: "fileTransfer",
        status: status,
        size: fileSize,
        readerIds: [sender._id],
      });
      await newMessage.save();

      const members = chat.members.map((member) => member.toString());

      const message = {
        ...newMessage._doc,
        sender,
      };
      messageSocket.sendMessage(message, members);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Create a file upload history message
   */
  createFileUploadHistory = async (
    chatId,
    sender,
    fileName,
    fileSize,
    status,
  ) => {
    try {
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        console.log("Chat not found !");
        return;
      }
      const newMessage = new messageModel({
        chatId,
        senderId: sender._id,
        content: fileName,
        type: "file",
        status: status,
        size: fileSize,
        readerIds: [sender._id],
      });
      await newMessage.save();
      const message = {
        ...newMessage._doc,
        sender,
      };
      messageSocket.sendMessage(
        message,
        chat.members.map((member) => member.toString()),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Create a voice call history message
   */
  endCalling = async (chatId) => {
    try {
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        console.log("Chat not found !");
        return;
      }
      if (!chat.calling) return;
      chat.calling = null;
      await chat.save();
      this.createSystemMessage(chat, "Voice call ended");
    } catch (err) {
      console.error(err);
    }
  };
}

module.exports = new ChatHistoryService();
