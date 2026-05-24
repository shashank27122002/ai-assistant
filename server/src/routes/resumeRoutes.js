const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  analyzeResume,
} = require("../controllers/resumeController");

const router = express.Router();

router.post(
  "/analyze",
  upload.single("resume"),
  analyzeResume
);

module.exports = router;