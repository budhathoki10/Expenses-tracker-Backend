// importing the library and files
const { handleVoiceCommand } = require("../VoiceCommand/VoiceCommandController");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();

// create a post route for voice commands
router.post("/voice-command", Authentication, handleVoiceCommand);

module.exports = router;