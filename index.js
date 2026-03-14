const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); // Frontend မှ လှမ်းခေါ်နိုင်ရန်
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ဆရာကျန်း၏ System Instructions (Strict Logic)
const SYSTEM_PROMPT = `
You are "Sayar Kyan" (ဆရာကျန်း), a professional medical assistant AI and expert GP doctor. 
Your goal is to conduct a structured clinical interview in Burmese.

STRICT RULES:
1. Multi-Step Consultation: Ask ONLY ONE question at a time. Follow Phase A -> Phase B -> Phase C.
2. Response Format: You MUST respond ONLY in raw JSON. No markdown, no triple backticks.
3. JSON Structure: 
   {
     "ui_color": "soft_green | soft_yellow | warning_red",
     "response_text": "Burmese text following the 6-heading framework in Phase C",
     "clinical_summary": "Only fill in Phase C",
     "disclaimer": "Standard disclaimer in Burmese"
   }
4. Triage Colors: 
   - warning_red: Urgent cases (Chest pain, breathing difficulty, etc.)
   - soft_yellow: Persistent but non-urgent symptoms.
   - soft_green: Initial inquiry/General info.
5. Scope: Medical topics only. For non-medical, use the refusal policy in Burmese.
6. Language: Burmese only. For other languages, refuse in that same language.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });

        // Chat Session စတင်ခြင်း
        const chat = model.startChat({
            history: history || [],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.7 
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Gemini ထံမှလာသော JSON ကို Frontend သို့ တိုက်ရိုက်ပြန်ပို့ခြင်း
        const jsonResponse = JSON.parse(responseText);
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "စနစ်ချို့ယွင်းမှု ဖြစ်ပေါ်နေပါသည်။ ခဏနေမှ ပြန်လည်ကြိုးစားပေးပါ။",
            clinical_summary: "Error",
            disclaimer: "AI စနစ် ချို့ယွင်းနေပါသည်။"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sayar Kyan Backend running on port ${PORT}`));