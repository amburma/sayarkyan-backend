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
        const { message } = req.body;
        // အရှင်းဆုံး URL နှင့် v1 ကို သုံးထားပါသည်
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [{
                parts: [{ text: `You are a medical AI. Respond only in Burmese and return ONLY a JSON object: {"response_text": "...", "ui_color": "soft_green"}. User says: ${message}` }]
            }]
        };

        const response = await axios.post(url, payload);
        const responseText = response.data.candidates[0].content.parts[0].text;
        
        // JSON သန့်စင်ခြင်း
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("DEBUG:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            response_text: "ခေတ္တ စောင့်ဆိုင်းပေးပါ။ ဆာဗာ ပြန်တက်လာပါပြီ။",
            ui_color: "warning_red"
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Stable Backend on ${PORT}`));