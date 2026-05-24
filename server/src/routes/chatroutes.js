const express = require("express");

const {
  chatWithAI,
  getChatHistory,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatWithAI);

router.get("/history", getChatHistory);

module.exports = router;