const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const chatHistoryService = require("./chatHistory.service");
const ObjectId = require("mongoose").Types.ObjectId;

class ChatService {
  /**
   * Create a new chat
   */
  async createChat(userId, members) {
    let chatMembers = members.map((member) => new ObjectId(member));
    chatMembers.push(userId);
    chatMembers = [...new Set(chatMembers)];

    // Check if chat already exists
    const existingChat = await chatModel.findOne({
      members: { $size: chatMembers.length, $all: chatMembers },
    });

    if (existingChat) {
      const error = new Error("Chat already exists");
      error.chatId = existingChat._id;
      throw error;
    }

    // Generate chat name
    let name = "New Chat";
    if (chatMembers.length > 2) {
      const users = await userModel
        .find({ _id: { $in: chatMembers } })
        .select("name");
      name = users.map((user) => user.name).join(", ");
    }

    const newChat = new chatModel({
      members: chatMembers,
      name: name,
    });

    await newChat.save();
    return newChat;
  }

  /**
   * Get user's chats with search functionality
   */
  async findUserChats(userId, search) {
    let chats = await chatModel
      .find({
        members: { $in: [userId] },
      })
      .select("-createdAt -updatedAt -__v")
      .populate("members", "_id avatar name");

    if (!chats || chats.length === 0) {
      return [];
    }

    // Filter chats based on search term
    if (search) {
      chats = chats.filter((chat) => {
        if (chat.name.toLowerCase().includes(search.toLowerCase())) {
          return true;
        }
        for (let member of chat.members) {
          if (member.name.toLowerCase().includes(search.toLowerCase())) {
            return true;
          }
        }
        return false;
      });
    }

    // Process chats and add last message info
    let outputChat = [];
    for (let chat of chats) {
      const processedChat = await this.processChatInfo(chat, userId);
      outputChat.push(processedChat);
    }

    return outputChat;
  }

  /**
   * Process individual chat information
   */
  async processChatInfo(chat, userId) {
    const lastMessage = await messageModel
      .findOne({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .select("senderId content createdAt readerIds type");

    let modifiedChat = {
      _id: chat._id,
      name: chat.name,
      avatar: chat.avatar,
      lastMessage: "No messages yet",
      lastTime: chat.createdAt,
      isMyMessage: false,
      read: true,
      isGroup: chat.members.length != 2,
      calling: chat.calling,
      members: chat.members
        .filter((member) => member._id.toString() !== userId.toString())
        .map((member) => member._id),
    };

    // Handle non-group chat display
    if (!modifiedChat.isGroup) {
      const otherMember = chat.members.find(
        (member) => member._id.toString() !== userId.toString(),
      );
      if (otherMember) {
        modifiedChat.avatar = otherMember.avatar;
        modifiedChat.name = otherMember.name;
      }
    }

    // Add last message info
    if (lastMessage) {
      modifiedChat.lastTime = lastMessage.createdAt;
      modifiedChat.lastMessage =
        lastMessage.type === "image" ? "📷 Image" : lastMessage.content;
      modifiedChat.isMyMessage =
        lastMessage.senderId?.toString() === userId.toString();
      modifiedChat.read = lastMessage.readerIds
        .map((objId) => objId.toString())
        .includes(userId.toString());
    }

    return modifiedChat;
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId, userId) {
    let chat = await chatModel
      .findOne({
        _id: chatId,
        members: { $in: [userId] },
      })
      .select("-createdAt -updatedAt -__v")
      .populate("members", "name avatar");

    if (!chat) {
      throw new Error("Chat not found");
    }

    let modifiedChat = {
      _id: chat._id,
      name: chat.name,
      avatar: chat.avatar,
      members: chat.members,
      isGroup: chat.members.length != 2,
      calling: chat.calling,
    };

    // Handle non-group chat display
    if (!modifiedChat.isGroup) {
      const otherMember = chat.members.find(
        (member) => member._id.toString() !== userId.toString(),
      );
      if (otherMember) {
        modifiedChat.avatar = otherMember.avatar;
        modifiedChat.name = otherMember.name;
      }
    }

    return modifiedChat;
  }

  /**
   * Add members to chat
   */
  async addMembersToChat(chatId, userId, newMembers) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    const membersToAdd = newMembers
      .map((member) => new ObjectId(member))
      .filter(
        (member) =>
          !chat.members
            .map((member) => member.toString())
            .includes(member.toString()),
      );

    chat.members = [...chat.members, ...membersToAdd];
    await chat.save();

    // Create system message
    const user = await userModel.findById(userId).select("name");
    const addedMembers = await userModel
      .find({ _id: { $in: membersToAdd } })
      .select("name");

    await chatHistoryService.createSystemMessage(
      chat,
      `${user.name} added ${addedMembers.map((member) => member.name).join(", ")} to chat`,
    );

    return {
      chat,
      addedMembers: membersToAdd,
    };
  }

  /**
   * Remove member from chat
   */
  async removeMemberFromChat(chatId, targetId, userId) {
    let chat;
    if (userId && userId !== targetId) {
      chat = await chatModel.findOne({
        _id: chatId,
        members: { $in: [targetId, userId] },
      });
    } else {
      chat = await chatModel.findOne({
        _id: chatId,
        members: { $in: [targetId] },
      });
    }

    if (!chat) {
      throw new Error("Chat not found");
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== targetId.toString(),
    );

    await chat.save();

    // Create system message
    const user = await userModel.findById(targetId).select("name");
    const actionUser = userId
      ? await userModel.findById(userId).select("name")
      : null;

    let messageContent;
    if (userId && userId !== targetId) {
      messageContent = `${actionUser.name} removed ${user.name} from chat`;
    } else {
      messageContent = `${user.name} left the chat`;
    }

    await chatHistoryService.createSystemMessage(chat, messageContent);

    return chat;
  }

  /**
   * Delete chat and all its messages
   */
  async deleteChat(chatId, userId) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Delete all messages in the chat
    await messageModel.deleteMany({ chatId: chatId });

    // Delete the chat
    await chatModel.findByIdAndDelete(chatId);

    return { message: "Chat deleted successfully" };
  }

  /**
   * Edit chat name and avatar
   */
  async editChat(chatId, userId, updateData) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Update allowed fields
    const allowedFields = ["name", "avatar"];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        chat[field] = updateData[field];
      }
    });

    await chat.save();

    // Create system message
    const user = await userModel.findById(userId).select("name");
    await chatHistoryService.createSystemMessage(
      chat,
      `${user.name} changed chat info`,
    );

    return chat;
  }

  /**
   * Check if user is a member of the chat
   */
  async isUserMemberOfChat(chatId, userId) {
    const chat = await chatModel.findOne({
      _id: chatId,
      members: { $in: [userId] },
    });
    return !!chat;
  }
}

module.exports = new ChatService();
