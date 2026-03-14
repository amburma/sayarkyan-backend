const express = require('express');
const cors = require('cors');
const axios = require('axios'); // SDK အစား axios ကို သုံးပါမည်
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash"; // အသစ်ဆုံးကို ပြန်သုံးပါမည်

const SYSTEM_PROMPT = `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Ask ONE Burmese question at a time. Respond ONLY in raw JSON: {"ui_color": "...", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Gemini API သို့ တိုက်ရိုက်လှမ်းခေါ်မည့် URL
        const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        // History ကို API format သို့ ပြောင်းလဲခြင်း
        const contents = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "{\"response_text\": \"ဟုတ်ကဲ့၊ ကျွန်တော် ဆရာကျန်းပါ။ ဘာကူညီပေးရမလဲခင်ဗျာ။\"}" }] },
            ...(history || []).map(h => ({
                role: h.role,
                parts: [{ text: typeof h.parts[0].text === 'string' ? h.parts[0].text : JSON.stringify(h.parts[0].text) }]
            })),
            { role: "user", parts: [{ text: message }] }
        ];

        const response = await axios.post(url, {
            contents: contents,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
            }
        });

        const responseText = response.data.candidates[0].content.parts[0].text;
        res.json(JSON.parse(responseText));

    } catch (error) {
        console.error("DIRECT API ERROR:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "API ချိတ်ဆက်မှု အဆင်မပြေပါ။",
            clinical_summary: "Error: " + (error.response?.data?.error?.message || error.message)
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend is running on port ${PORT}`));