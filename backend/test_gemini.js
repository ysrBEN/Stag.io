require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent('Say hi');
        console.log(`✅ ${modelName} WORKED:`, res.response.text().trim());
        return modelName;
    } catch (e) {
        console.log(`❌ ${modelName} FAILED: ${e.message}`);
        return null;
    }
}

async function run() {
    console.log('API KEY FIRST 8 CHARS:', process.env.GEMINI_API_KEY?.substring(0, 8));
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    let workingModel = null;
    for (const m of models) {
        workingModel = await testModel(m);
        if (workingModel) break;
    }

    if (workingModel) {
        console.log(`\nSUCCESS: Best model to use is ${workingModel}`);
    } else {
        console.log(`\nFAILED: No models worked.`);
    }
    process.exit();
}
run();
