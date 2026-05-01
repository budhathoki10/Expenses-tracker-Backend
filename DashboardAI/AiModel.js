const { GoogleGenerativeAI } = require("@google/generative-ai");

const AIModel = async (Prompt) => {
  try {
    const ai = new GoogleGenerativeAI(process.env.GOOGLE_API);

    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: Prompt }] }],
    });

 let text = result.response.text();

// Strip markdown
text = text
  .replace(/#{1,6}\s/g, "")
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/\*(.*?)\*/g, "$1")
  .replace(/^[-*•]\s+/gm, "")
  .replace(/`{1,3}/g, "");

// Convert newlines to HTML line breaks
text = text.replace(/\n/, "<br>");

return text;

  } catch (error) {
    console.error("AIModel error:", error.message);
    throw error;
  }
};

module.exports = AIModel;