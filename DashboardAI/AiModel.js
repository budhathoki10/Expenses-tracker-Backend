const { Ollama } = require("ollama");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama2";
console.log("ollama model is:", OLLAMA_MODEL);
const GOOGLE_API_KEY = process.env.GOOGLE_API;

if (!OLLAMA_URL) {
  throw new Error("Missing OLLAMA_URL in environment configuration");
}
if (!GOOGLE_API_KEY) {
  console.warn("Warning: GOOGLE_API is not set, Gemini fallback may fail");
}

const ollama = new Ollama({ host: OLLAMA_URL });

const AIModelOllama = async (Prompt) => {
  const response = await ollama.generate({
    model: OLLAMA_MODEL,
    prompt: Prompt,
    stream: true,
  });
  return response.response;
};

const AIModelGemini = async (Prompt) => {
  const ai = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = ai.getGenerativeModel({ model: "	gemini-3-flash-preview" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: Prompt }] }],
  });
  return result.response.text();
};

const formatText = (text) => {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/`{1,3}/g, "")
.replace(/\n/g, "<br>"); 
};

const AIModel = async (Prompt) => {
  try {
    console.log("Trying Ollama at", OLLAMA_URL, "with model", OLLAMA_MODEL);
    const text = await AIModelOllama(Prompt);
    console.log("Ollama responded successfully.");
    return formatText(text);
  } catch (ollamaError) {
    console.warn("Ollama failed:", ollamaError.message);
    if (ollamaError.response) {
      console.warn("Ollama response body:", ollamaError.response.data || ollamaError.response.text);
    }
    console.log("Falling back to Gemini...");
    try {
      const text = await AIModelGemini(Prompt);
      console.log("Gemini responded successfully.");
      return formatText(text);
    } catch (geminiError) {
      console.error("Gemini also failed:", geminiError.message);
      if (geminiError.response) {
        console.error("Gemini response body:", geminiError.response.data || geminiError.response.text);
      }
      throw new Error(`Both AI models failed. Ollama: ${ollamaError.message} | Gemini: ${geminiError.message}`);
    }
  }
};

module.exports = AIModel;