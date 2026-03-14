const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
// သင်ကူးထားတဲ့ Project ID ကို ဒီမှာ အစားထိုးပါ
const PROJECT_ID = "sayarkyan"; 
const REGION = "us-central1"; 

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Vertex AI API Endpoint
        const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [
                ...(history || []).map(h => ({
                    role: h.role,
                    parts: [{ text: h.parts[0].text }]
                })),
                {
                    role: "user",
                    parts: [{ text: `You are "Sayar Kyan" (ဆရာကျန်း), a medical AI. Respond only in Burmese and return ONLY a valid JSON object. 
                    JSON Format: {"ui_color": "soft_green", "response_text": "...", "clinical_summary": "...", "disclaimer": "..."}. 
                    User says: ${message}` }]
                }
            ]
        };

        const response = await axios.post(url, payload);
        
        const responseText = response.data.candidates[0].content.parts[0].text;
        // AI ရဲ့ response ထဲက JSON ကို သန့်စင်ခြင်း
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("Vertex AI Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ 
            response_text: "ဆာဗာ ချိတ်ဆက်မှု အဆင်မပြေပါ။ ခဏနေမှ ပြန်စမ်းကြည့်ပါ။",
            ui_color: "warning_red" 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Vertex AI Backend is Live!`));