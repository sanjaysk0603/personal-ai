// routes/chat.js
// POST /chat  { "message": "..." }  ->  { "reply": "..." }

const express = require('express');
const router = express.Router();

const { chat } = require('../memory/gemini');
const { saveMessage, getRecentMessages, saveFact, getRelevantFacts } = require('../memory/retrieval');
const { extractFacts } = require('../memory/extract');

const SYSTEM_PROMPT = `You are Sanjay's personal AI assistant. You are helpful, direct, and remember things about him across conversations. Use the relevant memories provided to personalize your answers, but don't force them in if irrelevant.`;

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" string in request body.' });
  }

  try {
    // 1. Gather context: relevant long-term facts + recent conversation
    const [relevantFacts, recentMessages] = await Promise.all([
      getRelevantFacts(message, 5),
      getRecentMessages(8), // now async (Turso), so we await it directly
    ]);

    let systemInstruction = SYSTEM_PROMPT;
    if (relevantFacts.length > 0) {
      systemInstruction += `\n\nRelevant things you know about Sanjay:\n- ${relevantFacts.join('\n- ')}`;
    }

    // 2. Build the message list: recent history + new message
    const history = recentMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      text: m.content,
    }));
    history.push({ role: 'user', text: message });

    // 3. Call Gemini for the reply
    const reply = await chat(history, systemInstruction);

    // 4. Save this exchange
    await saveMessage('user', message);
    await saveMessage('assistant', reply);

    // 5. Fire-and-forget: extract + save any durable facts from the user's message
    extractFacts(message)
      .then(facts => Promise.all(facts.map(saveFact)))
      .catch(err => console.warn('Fact extraction/save failed:', err.message));

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Something went wrong.', details: err.message });
  }
});

module.exports = router;
