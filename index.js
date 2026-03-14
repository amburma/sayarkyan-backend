const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
// gemini-1.5-flash သို့မဟုတ် gemini-pro ကို သုံးနိုင်ပါသည်
const MODEL_NAME = "gemini-1.5-flash"; 

const SYSTEM_PROMPT = `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Respond ONLY in Burmese. Ask ONE question at a time. Format your output as a valid JSON object only.
JSON example: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        // Payload ကို ပိုမိုရိုးရှင်းအောင် ပြုပြင်ထားသည်
        const contents = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "{\"response_text\": \"ဟုတ်ကဲ့၊ ကျွန်တော် ဆရာကျန်းပါ။ ဘာများကူညီပေးရမလဲခင်ဗျာ။\"}" }] },
            ...(history || []).map(h => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: typeof h.parts[0].text === 'string' ? h.parts[0].text : JSON.stringify(h.parts[0].text) }]
            })),
            { role: "user", parts: [{ text: message }] }
        ];

        const response = await axios.post(url, {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
                // responseMimeType ကို ဖယ်ထုတ်ထားပါသည် (Error တက်ခြင်းမှ ကာကွယ်ရန်)
            }
        });

        const responseText = response.data.candidates[0].content.parts[0].text;
        
        // JSON သန့်စင်ခြင်း
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("DEBUG ERROR DETAILS:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "ဆာဗာ ချိတ်ဆက်မှု အခက်အခဲရှိနေပါသည်။",
            clinical_summary: "Error: " + (error.response?.data?.error?.message || error.message)
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is Live on Port ${PORT}`));