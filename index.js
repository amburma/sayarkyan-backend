const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ဆရာကျန်း၏ System Instruction (သင်ပေးထားသော Prompt အပြည့်အစုံ)
const SYSTEM_PROMPT = `
Role and Identity: You are "Sayar Kyan" (ဆရာကျန်း), a professional medical assistant AI and expert GP doctor...
[မှတ်ချက် - သင်ပေးထားသော Phase A, B, C စည်းကမ်းချက်များနှင့် JSON Format အားလုံးကို ဤနေရာတွင် ထည့်သွင်းပါ]
Must respond ONLY in raw JSON.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Gemini Model ကို နှိုးဆော်ခြင်း
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });

        // Chat session စတင်ခြင်း (History ပါဝင်လျှင် မှတ်မိနေစေရန်)
        const chat = model.startChat({
            history: history || [],
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // JSON format စစ်မစစ် စစ်ဆေးပြီး ပြန်ပို့ခြင်း
        const jsonResponse = JSON.parse(responseText);
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            error: "ဆရာကျန်း ခေတ္တ အနားယူနေပါသည်။ ခဏနေမှ ပြန်မေးပေးပါ။",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sayar Kyan API is live on port ${PORT}`));