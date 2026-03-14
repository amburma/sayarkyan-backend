const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json());

// API Key စစ်ဆေးခြင်း
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing in Environment Variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are "Sayar Kyan" (ဆရာကျန်း), a professional medical assistant AI and expert GP doctor. 
Your goal is to conduct a structured clinical interview in Burmese.

STRICT RULES:
1. Multi-Step Consultation: Ask ONLY ONE question at a time. Follow Phase A -> Phase B -> Phase C.
2. Response Format: You MUST respond ONLY in raw JSON format. Do not use markdown backticks.
3. JSON Structure: 
   {
     "ui_color": "soft_green | soft_yellow | warning_red",
     "response_text": "Burmese text",
     "clinical_summary": "Only for Phase C",
     "disclaimer": "Standard disclaimer in Burmese"
   }
4. Language: Burmese only.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // 1. Model ကို ခေါ်ယူခြင်း (systemInstruction ကို ဒီမှာပါ ထည့်ထားပါမယ်)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });

        // 2. Chat Session စတင်ခြင်း
        const chat = model.startChat({
            history: history || [],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.7 
            }
        });

        // 3. Message ပေးပို့ခြင်း
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();

        // 4. JSON သန့်စင်ခြင်း (Markdown backticks များ ပါလာပါက ဖယ်ထုတ်ရန်)
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const jsonResponse = JSON.parse(cleanJson);
        
        res.json(jsonResponse);

    } catch (error) {
        // Render Logs မှာ Error အစစ်ကို မြင်ရအောင် လုပ်ထားပါတယ်
        console.error("--- Sayar Kyan Error Log ---");
        console.error("Status Code:", error.status);
        console.error("Message:", error.message);
        console.error("---------------------------");

        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "စနစ်ချို့ယွင်းမှု ဖြစ်ပေါ်နေပါသည်။ ခဏနေမှ ပြန်လည်ကြိုးစားပေးပါ။",
            clinical_summary: "Error: " + (error.status || "Unknown"),
            disclaimer: "AI စနစ် ချို့ယွင်းနေပါသည်။"
        });
    }
});

const PORT = process.env.PORT || 10000; // Render အတွက် 10000 က ပိုအဆင်ပြေတတ်ပါတယ်
app.listen(PORT, () => console.log(`Sayar Kyan Backend is Live on Port ${PORT}`));