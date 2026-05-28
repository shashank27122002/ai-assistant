const { generateAIResponse } = require("../services/geminiService");

const Conversation = require("../models/conversationModel");

const chatWithAI = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let conversation;

    let messagesForAI = [];

    // CONTINUE EXISTING CHAT
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      // SEND PREVIOUS CHAT HISTORY TO AI
      messagesForAI = [
        ...conversation.messages,

        {
          role: "user",
          content: message,
        },
      ];
    }

    // CREATE NEW CHAT
    else {
      messagesForAI = [
        {
          role: "user",
          content: message,
        },
      ];
    }

    // GENERATE AI RESPONSE
    const reply = await generateAIResponse(messagesForAI);

    // UPDATE EXISTING CHAT
    if (conversationId) {
      conversation.messages.push({
        role: "user",
        content: message,
      });

      conversation.messages.push({
        role: "assistant",
        content: reply,
      });

      await conversation.save();
    }

    // CREATE NEW CONVERSATION
    else {
      conversation = await Conversation.create({
        title: message,

        messages: [
          {
            role: "user",
            content: message,
          },

          {
            role: "assistant",
            content: reply,
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      reply,
      conversation,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chats = await Conversation.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
  getChatHistory,
};