const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are "Sayar Kyan" (ဆရာကျန်း), a professional medical AI. 
Rules: 
1. Ask ONE Burmese question at a time. 
2. Response must be raw JSON.
JSON Format: {"ui_color": "...", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // 404 ကို ကျော်လွှားရန် ပိုမိုတည်ငြိမ်သော gemini-pro ကို သုံးကြည့်ပါမည်
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // System Instruction ကို History ရဲ့ အစမှာ အတင်းထည့်ပေးခြင်း
        const chatHistory = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "ဟုတ်ကဲ့၊ ကျွန်တော် ဆရာကျန်းပါ။ ဘာကူညီပေးရမလဲခင်ဗျာ။" }] },
            ...(history || [])
        ];

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { 
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        let responseText = response.text();
        
        // JSON မဟုတ်သော စာသားများ (```json) ပါလာပါက ဖယ်ထုတ်ခြင်း
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("--- DEBUG ERROR ---");
        console.error(error.message);
        
        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "ဆာဗာ ချိတ်ဆက်မှု အခက်အခဲရှိနေပါသည်။ ခဏနေမှ ပြန်စမ်းကြည့်ပါ။",
            clinical_summary: "Error: " + error.message,
            disclaimer: "AI စနစ် ချို့ယွင်းနေပါသည်။"
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));