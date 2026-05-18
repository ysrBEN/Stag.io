require('dotenv').config();
const { callGemini } = require('./utils/geminiClient');
const fs = require('fs');

async function run() {
    try {
        const res = await callGemini("Say hello in 2 words");
        fs.writeFileSync('error_dump.json', JSON.stringify({ success: true, res }, null, 2));
    } catch (e) {
        fs.writeFileSync('error_dump.json', JSON.stringify({
            success: false,
            message: e.message,
            stack: e.stack,
            response: e.response ? e.response.data : null,
            status: e.response ? e.response.status : null
        }, null, 2));
    }
}
run();
