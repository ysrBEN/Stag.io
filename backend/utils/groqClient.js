const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAI(prompt, systemPrompt = 'You are a helpful assistant for Stag.io, an Algerian internship platform. Respond in French.') {
    const response = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
    });
    return response.choices[0].message.content;
}

async function callAIChat(messages) {
    const response = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
    });
    return response.choices[0].message.content;
}

module.exports = { callAI, callAIChat, groq };
