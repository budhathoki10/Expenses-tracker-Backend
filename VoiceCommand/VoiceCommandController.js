const { parseVoiceCommand } = require("./VoiceCommandParser");

const handleVoiceCommand = async (req, res) => {
  try {
    const { voiceText } = req.body;

    if (!voiceText || typeof voiceText !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Voice text is required"
        
      });
    }

    // Parse the voice command using AI
    const parsedCommand = await parseVoiceCommand(voiceText);

    if (parsedCommand.error) {
      return res.status(400).json({
        success: false,
        message: parsedCommand.error,
        originalText: voiceText
      });
    }

    // Return the parsed command without saving (frontend will handle saving)
    return res.status(200).json({
      success: true,
      message: "Voice command parsed successfully",
      voiceCommand: {
        originalText: voiceText,
        parsedData: {
          action: parsedCommand.action,
          amount: parsedCommand.amount,
          category: parsedCommand.category,
          description: parsedCommand.description,
          account: parsedCommand.account
        }
      }
    });

  } catch (error) {
    console.error("Voice command handling error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process voice command",
      error: error.message
    });
  }
};

module.exports = { handleVoiceCommand };