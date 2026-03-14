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

        // v1 endpoint နှင့် model အမည်ကို အတိအကျ သတ်မှတ်ထားပါသည်
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [
                ...(history || []).map(h => ({
                    role: h.role === 'model' ? 'model' : 'user',
                    parts: [{ text: typeof h.parts[0].text === 'string' ? h.parts[0].text : JSON.stringify(h.parts[0].text) }]
                })),
                {
                    role: "user",
                    parts: [{ text: `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Ask ONE question at a time. Respond ONLY in Burmese. Format your output as a valid JSON object only. JSON format: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}. User says: ${message}` }]
                }
            ]
        };

        const response = await axios.axios.post(url, payload);
        
        if (response.data.candidates && response.data.candidates[0].content) {
            const responseText = response.data.candidates[0].content.parts[0].text;
            const cleanJson = responseText.replace(/```json|```/g, "").trim();
            res.json(JSON.parse(cleanJson));
        } else {
            throw new Error("Invalid API Response");
        }

    } catch (error) {
        console.error("STABLE API ERROR:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            ui_color: "warning_red",
            response_text: "ဆာဗာ ချိတ်ဆက်မှု အဆင်မပြေပါ။ ခဏနေမှ ပြန်စမ်းကြည့်ပါ။",
            clinical_summary: "Error: " + (error.response?.data?.error?.message || error.message)
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend is running on ${PORT}`));