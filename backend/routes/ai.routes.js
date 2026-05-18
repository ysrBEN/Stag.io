const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const { callAI, callAIChat, groq } = require('../utils/groqClient');
const Offer = require('../models/Offer');
const User = require('../models/User');

// TEST ROUTE
router.get('/test', (req, res) => {
    res.json({ message: 'AI routes are working (using Groq API)' });
});

// FEATURE 1 — 🤖 AI Chatbot Assistant
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        const offers = await Offer.find({}).limit(5);
        const offersContext = offers.map(o => `${o.title} - ${o.wilaya}`).join(', ');

        const systemContext = `Tu es l'assistant virtuel de Stag.io, une plateforme algérienne de gestion des stages.

TON RÔLE: Aider les étudiants à trouver des stages et les guider sur la plateforme.

TU PEUX RÉPONDRE À:
- Les offres de stage disponibles sur la plateforme
- Comment postuler, créer un profil, ajouter des compétences
- Conseils carrière pour les étudiants algériens (CV, entretien, compétences à apprendre)
- Recommandations d'offres selon les compétences de l'étudiant
- Questions sur les entreprises présentes sur la plateforme
- Comment fonctionne le processus de stage (candidature → acceptation → convention)

OFFRES DISPONIBLES SUR LA PLATEFORME:
${offersContext}

RÈGLES:
- Réponds TOUJOYRS en français ou en darija algérien
- Sois encourageant et professionnel
- Réponses courtes et directes (3-4 phrases maximum)
- Ne refuse pas les questions sur le fonctionnement du site ou des recherches d'offres`;

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemContext },
                ...conversationHistory.slice(-4).map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                })),
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 300,
            stream: true,
        });

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('AI Route Error (Chat Streaming):', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || 'AI service temporarily unavailable' });
        } else {
            res.end();
        }
    }
});

// FEATURE 2 — 📊 Smart Profile Analyzer
router.post('/analyze-profile', authMiddleware, async (req, res) => {
    try {
        // req.user from authMiddleware contains id usually, but wait, looking back at authMiddleware, it puts decoded in req.user.
        // Usually it sets req.user.id or _id, let's assume id from the instructions "req.user.id"
        const student = await User.findById(req.user.id);
        if (!student) return res.status(404).json({ message: 'User not found' });

        const allOffers = await Offer.find({});

        const matchingOffers = allOffers.filter(offer =>
            offer.technologies?.some(tech =>
                student.skills?.map(s => s.toLowerCase()).includes(tech.toLowerCase())
            )
        ).slice(0, 5).map(o => o.title);

        const prompt = `Analyze this Algerian student's internship profile and respond ONLY with valid JSON (no markdown, no backticks):

Student Profile:
- Name: ${student.name}
- University: ${student.university || 'Not specified'}
- Field: ${student.fieldOfStudy || 'Not specified'}
- Year: ${student.academicYear || 'Not specified'}
- Skills: ${student.skills?.join(', ') || 'None'}
- GitHub: ${student.githubUrl ? 'Yes' : 'No'}
- Portfolio: ${student.portfolioUrl ? 'Yes' : 'No'}
- Bio: ${student.bio || 'Not filled'}
- Matching offers available: ${matchingOffers.join(', ') || 'None'}

Respond with ONLY this JSON structure:
{
  "score": 75,
  "scoreLabel": "Bon profil",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "recommendedOffers": ["offer1", "offer2"],
  "advice": "One paragraph of general advice in French"
}`;

        let text = await callAI(prompt, 'You are an analytics assistant. Respond ONLY with valid JSON structure, no extra text.');
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        const analysis = JSON.parse(jsonMatch[0]);
        res.json(analysis);
    } catch (error) {
        console.error('AI Route Error (Profile Analysis):', error.message);
        console.error('Full error:', error);
        res.status(500).json({ message: error.message || 'AI service temporarily unavailable' });
    }
});

// FEATURE 3 — ✍️ AI Cover Letter Generator
router.post('/cover-letter', authMiddleware, async (req, res) => {
    try {
        const { offerId } = req.body;
        const student = await User.findById(req.user.id);
        const offer = await Offer.findById(offerId).populate('company', 'name location industry');

        if (!student || !offer) {
            return res.status(404).json({ message: 'Student or Offer not found' });
        }

        const coverLetterPrompt = `Write a professional internship cover letter in French for an Algerian university student.

Student: ${student.name}
University: ${student.university || 'Université Algérienne'}
Field: ${student.fieldOfStudy || 'Informatique'}
Year: ${student.academicYear || 'L3'}
Skills: ${student.skills?.join(', ') || 'Non spécifiées'}
GitHub: ${student.githubUrl || 'Non fourni'}

Internship Position: ${offer.title}
Company: ${offer.company?.name || 'Entreprise'}
Location: ${offer.company?.location || offer.location || 'Algeria'}, Algeria
Required Skills: ${offer.technologies?.join(', ') || 'N/A'}
Duration: ${offer.duration || 'N/A'}
Type: ${offer.type || 'N/A'}

Write a complete, professional cover letter (3-4 paragraphs) including:
1. Professional greeting to the recruitment team
2. Why they're interested in this specific company and role
3. How their skills match the requirements
4. Enthusiastic closing paragraph
Make it personal and specific. Sign with the student's name.`;

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a professional cover letter writer. Write in French for an Algerian student.' },
                { role: 'user', content: coverLetterPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 500,
            stream: true,
        });

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('AI Route Error (Cover Letter Streaming):', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || 'AI service temporarily unavailable' });
        } else {
            res.end();
        }
    }
});

module.exports = router;
