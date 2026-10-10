// memory/gemini.js
// Thin wrapper around the Gemini REST API for chat + embeddings.

require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const CHAT_MODEL = 'gemini-3.1-flash-lite';
const EMBED_MODEL = 'gemini-embedding-001';

async function chat(messages, systemInstruction) {
  // messages: [{ role: 'user'|'model', text: '...' }, ...]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }))
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini chat failed: ${JSON.stringify(data)}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function embed(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini embedding failed: ${JSON.stringify(data)}`);
  }

  return data.embedding.values;
}

module.exports = { chat, embed };
