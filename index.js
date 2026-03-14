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
        
        // 404 Error မတက်စေရန် v1 stable endpoint ကို သုံးပါသည်
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [
                ...(history || []).map(h => ({
                    role: h.role,
                    parts: [{ text: h.parts[0].text }]
                })),
                {
                    role: "user",
                    parts: [{ text: `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Respond only in Burmese and return ONLY a valid JSON object. 
                    Format: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}.
                    User: ${message}` }]
                }
            ]
        };

        const response = await axios.post(url, payload);
        const responseText = response.data.candidates[0].content.parts[0].text;
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("STABLE API ERROR:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            response_text: "ခေတ္တစောင့်ပေးပါ၊ ဆာဗာပြန်တက်လာပါပြီ။",
            ui_color: "warning_red" 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Sayar Kyan is running on port ${PORT}`));