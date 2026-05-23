import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

const isConfigured = apiKey && apiKey !== "xxx";

export const genAI = new GoogleGenerativeAI(
  isConfigured ? apiKey : "AIzaSyPlaceholder-Key"
);

// We use the recommended gemini-2.5-flash models for advanced structured JSON reasoning
export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const getGeminiConfig = () => ({
  isConfigured,
});
