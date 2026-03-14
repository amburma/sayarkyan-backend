const express = require('express');
const app = express();
app.use(express.json());

// ဆရာကျန်းရဲ့ စနစ်သတ်မှတ်ချက်များ
const SYSTEM_PROMPT = `You are "Sayar Kyan" (ဆရာကျန်း)... [သင်ပေးထားတဲ့ Prompt အပြည့်အစုံကို ဒီနေရာမှာ ထည့်သွင်းပါ]`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // မှတ်ချက် - လက်တွေ့တွင် OpenAI သို့မဟုတ် Gemini API သို့ ဒီနေရာမှ လှမ်းခေါ်ရပါမည်။
        // အောက်ပါတို့သည် ပုံစံတူ (Simulation) ထုတ်ပေးခြင်း ဖြစ်သည်။

        const responsePayload = {
            "ui_color": "soft_green",
            "response_text": "ဟုတ်ကဲ့ပါ၊ နားလည်ပါတယ်ခင်ဗျာ။ အခုလို ဗိုက်အောင့်တာက ဘယ်လောက်ကြာပြီလဲခင်ဗျာ?",
            "clinical_summary": "",
            "disclaimer": "တိကျတဲ့ ဆေးညွှန်းအတွက် ဆရာဝန် (သို့မဟုတ်) ဆေးဝါးကျွမ်းကျင်သူနဲ့ သေချာတိုင်ပင်ပါ။ သတိပြုရန် - ဤအဖြေသည် AI မှ ပေးသော ဗဟုသုတလမ်းညွှန်ချက်သာ ဖြစ်ပါသည်။ ဆေးဝါးသောက်သုံးခြင်း မပြုမီ ဆေးဝါးကျွမ်းကျင်သူ သို့မဟုတ် ဆရာဝန်နှင့် မဖြစ်မနေ တိုင်ပင်ဆွေးနွေးပါ။"
        };

        // Strict JSON format သတ်မှတ်ချက်အတိုင်း ပြန်ပို့ပေးခြင်း
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(responsePayload));

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sayar Kyan Backend running on port ${PORT}`));