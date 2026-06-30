const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
const GOOGLE_API_KEY = process.env.GOOGLE_API;

if (!NVIDIA_API_KEY) {
  console.warn("Warning: NVIDIA_API_KEY is not set, NVIDIA AI calls will fail");
}
if (!GOOGLE_API_KEY) {
  console.warn("Warning: GOOGLE_API is not set, Gemini fallback may fail");
}

const createNvidiaClient = () =>
  new OpenAI({
    apiKey: NVIDIA_API_KEY,
    baseURL: NVIDIA_BASE_URL,
  });

const AIModelNvidia = async (Prompt) => {
  if (!NVIDIA_API_KEY) {
    throw new Error("Missing NVIDIA_API_KEY in environment configuration");
  }

  const openai = createNvidiaClient();
  const completion = await openai.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: Prompt }],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    reasoning_budget: 16384,
    chat_template_kwargs: { enable_thinking: true },
    stream: true,
  });

  let output = "";
  for await (const chunk of completion) {
    output += chunk.choices[0]?.delta?.content || "";
  }

  return output;
};

const AIModelGemini = async (Prompt) => {
  const ai = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });
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
    .replace(/`{1,3}/g, "");
};

const AIModel = async (Prompt) => {
  try {
    console.log("Trying NVIDIA AI with model", NVIDIA_MODEL);
    const text = await AIModelNvidia(Prompt);
    console.log("NVIDIA AI responded successfully.");
    return formatText(text);
  } catch (nvidiaError) {
    console.warn("NVIDIA AI failed:", nvidiaError.message);
    if (nvidiaError.response) {
      console.warn("NVIDIA AI response body:", nvidiaError.response.data || nvidiaError.response.text);
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
      throw new Error(`Both AI models failed. NVIDIA: ${nvidiaError.message} | Gemini: ${geminiError.message}`);
    }
  }
};

module.exports = AIModel;
