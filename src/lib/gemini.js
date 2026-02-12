/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY? process.env.REACT_APP_GEMINI_API_KEY : "";
const ai = new GoogleGenAI({ apiKey:apiKey });

function createChat(history) {
    return ai.chats.create({ model: "gemini-2.5-flash", history: history });
}

export default createChat;
