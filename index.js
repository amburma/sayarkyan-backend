const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // 404 Error မတက်စေရန် v1 stable endpoint ကို တိုက်ရိုက်သုံးပါသည်
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [
                ...(history || []).map(h => ({
                    role: h.role === 'model' ? 'model' : 'user',
                    parts: [{ text: h.parts[0].text }]
                })),
                {
                    role: "user",
                    parts: [{ text: `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Respond only in Burmese and return ONLY a valid JSON object. 
                    JSON Format: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}.
                    User: ${message}` }]
                }
            ]
        };

        const response = await axios.post(url, payload);
        
        if (response.data && response.data.candidates) {
            const responseText = response.data.candidates[0].content.parts[0].text;
            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            res.json(JSON.parse(cleanJson));
        } else {
            throw new Error("Invalid API Response Structure");
        }

    } catch (error) {
        // Render Logs မှာ Error အစစ်ကို မြင်ရအောင် ထုတ်ပြခြင်း
        console.error("STABLE API ERROR:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            response_text: "ဆာဗာ ချိတ်ဆက်မှု အဆင်မပြေပါ။ ခဏနေမှ ပြန်စမ်းကြည့်ပါ။",
            ui_color: "warning_red",
            clinical_summary: "Error occurred",
            disclaimer: "AI စနစ် ချို့ယွင်းနေပါသည်။"
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Sayar Kyan Backend is Live on Port ${PORT}`));