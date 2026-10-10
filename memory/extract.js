// memory/extract.js
// Asks Gemini to pull out durable facts worth remembering from a message,
// e.g. "my birthday is March 3rd" or "I'm learning React Native".
// Skips one-off/throwaway stuff like "what's the weather today".

const { chat } = require('./gemini');

const EXTRACT_PROMPT = `You extract durable, worth-remembering facts about the user from their message.
Rules:
- Only extract facts that would still be true/relevant weeks or months from now (preferences, ongoing projects, personal details, decisions, plans).
- Ignore one-off questions, small talk, or anything purely about right now.
- Return ONLY a JSON array of short fact strings, nothing else. Example: ["Learning React Native", "Based in Coimbatore"]
- If there's nothing worth remembering, return an empty array: []`;

async function extractFacts(userMessage) {
  const raw = await chat(
    [{ role: 'user', text: userMessage }],
    EXTRACT_PROMPT
  );

  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const facts = JSON.parse(cleaned);
    return Array.isArray(facts) ? facts : [];
  } catch (err) {
    console.warn('Fact extraction: could not parse response, skipping.', raw);
    return [];
  }
}

module.exports = { extractFacts };
