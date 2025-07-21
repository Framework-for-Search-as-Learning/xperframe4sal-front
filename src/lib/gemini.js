import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

function createChat(history) {
    return ai.chats.create({ model: "gemini-2.5-flash", history: history });
}

export default createChat;
