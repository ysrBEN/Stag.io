require('dotenv').config();
const { callGemini } = require('./utils/geminiClient');

async function run() {
    try {
        console.log("callGemini type:", typeof callGemini);
        console.log("Testing callGemini API request...");
        const res = await callGemini("Say hello in 2 words");
        console.log("SUCCESS:", res);
    } catch (e) {
        console.error("EXACT ERROR:", e.message);
        if (e.response) {
            console.error("AXIOS RESPONSE DATA:", JSON.stringify(e.response.data));
            console.error("AXIOS RESPONSE STATUS:", e.response.status);
        }
        console.error("STACK:", e.stack);
    }
}
run();
