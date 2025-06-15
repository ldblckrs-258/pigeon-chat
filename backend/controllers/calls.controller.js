const callsService = require("../services/calls.service");
const voiceCallSocket = require("../services/socket.services/voiceCall");

/**
 * Initiates a voice call in a specific chat.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to start voice call in
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {string} req.user.name - Name of the calling user
 * @param {Object} res - Express response object
 */
const startVoiceCall = async (req, res) => {
  const userId = req.user._id;
  const userName = req.user.name;
  const chatId = req.body.chatId;

  try {
    const { chat, receivers } = await callsService.startVoiceCall(
      chatId,
      userId,
      userName,
    );

    voiceCallSocket.voiceCallStart(chatId, receivers);

    res.status(204).send({ message: "Voice call started" });
  } catch (err) {
    if (err.message === "Chat not found") {
      return res.status(404).send({ message: err.message });
    }

    if (err.message === "Chat is already in a call") {
      return res.status(304).send({ message: err.message });
    }

    res
      .status(500)
      .send({ message: "Request failed, please try again later." });
  }
};

/**
 * Ends an ongoing voice call in a specific chat.
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.chatId - ID of the chat to end voice call in
 * @param {Object} req.user - Authenticated user object from middleware
 * @param {Object} res - Express response object
 */
const endVoiceCall = async (req, res) => {
  const userId = req.user._id;
  const chatId = req.body.chatId;

  try {
    const { chat, receivers } = await callsService.endVoiceCall(chatId, userId);

    voiceCallSocket.voiceCallEnd(chatId, receivers);

    res.status(200).send({ message: "Voice call ended" });
  } catch (err) {
    if (err.message === "Chat not found") {
      return res.status(304).send({ message: err.message });
    }

    if (err.message === "Chat is not in a call") {
      return res.status(304).send({ message: err.message });
    }

    res
      .status(500)
      .send({ message: "Request failed, please try again later." });
  }
};

module.exports = {
  startVoiceCall,
  endVoiceCall,
};
