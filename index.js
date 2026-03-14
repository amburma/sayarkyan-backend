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

        if (!message) {
            return res.status(400).json({
                response_text: "Message field is required.",
                ui_color: "warning_red"
            });
        }

        // v1 မှာ Flash model မတွေ့ရတတ်လို့ v1beta ကို အသုံးပြုထားပါတယ်
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // History ပါဝင်လျှင် ထည့်သွင်းရန် (မပါလျှင် empty array)
        const chatHistory = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        const payload = {
            contents: [
                ...chatHistory,
                {
                    parts: [
                        {
                            text: `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Respond only in Burmese and return ONLY a valid JSON object.
                            JSON Format: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}
                            User says: ${message}`
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(url, payload);

        const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("Invalid API response format");
        }

        // Markdown format (```json) များပါလာပါက ဖယ်ထုတ်ခြင်း
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        return res.json(JSON.parse(cleanJson));

    } catch (error) {
        // Render Logs မှာ Error အစစ်ကို မြင်ရအောင် ထုတ်ပြခြင်း
        console.error("DEBUG ERROR DETAILS:", error.response ? JSON.stringify(error.response.data) : error.message);

        return res.status(500).json({
            response_text: "ခေတ္တ စောင့်ဆိုင်းပေးပါ။ ဆာဗာ ပြန်တက်လာပါပြီ။",
            ui_color: "warning_red",
            clinical_summary: "Error occured",
            disclaimer: "AI စနစ် ချို့ယွင်းနေပါသည်။"
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Sayar Kyan Backend is Live on Port ${PORT}`));