const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Backend အလုပ်လုပ်နေပါပြီ ဆရာကျန်း!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});