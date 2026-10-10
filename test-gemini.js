// test-gemini.js
// Run this FIRST, standalone, to confirm your Gemini API key actually works.
// Usage: node test-gemini.js
//
// Get a free key from: https://aistudio.google.com/app/apikey
// Then put it in a .env file (see .env.example) as GEMINI_API_KEY=your_key_here

require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ No GEMINI_API_KEY found. Create a .env file (copy .env.example) and add your key.');
  process.exit(1);
}

const CHAT_MODEL = 'gemini-3.1-flash-lite';
const EMBED_MODEL = 'gemini-embedding-001';

async function testChat() {
  console.log(`Testing Gemini chat (${CHAT_MODEL})...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Say hello in one short sentence.' }] }]
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Chat call failed. Status:', res.status);
    console.error(JSON.stringify(data, null, 2));
    return false;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('✅ Chat works! Response:', text);
  return true;
}

async function testEmbedding() {
  console.log(`\nTesting Gemini embeddings (${EMBED_MODEL})...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text: 'This is a test sentence.' }] }
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Embedding call failed. Status:', res.status);
    console.error(JSON.stringify(data, null, 2));
    return false;
  }

  const values = data.embedding?.values;
  console.log(`✅ Embeddings work! Got vector of length ${values?.length}`);
  return true;
}

(async () => {
  const chatOk = await testChat();
  const embedOk = await testEmbedding();

  console.log('\n--- Summary ---');
  console.log('Chat:', chatOk ? 'OK' : 'FAILED');
  console.log('Embeddings:', embedOk ? 'OK' : 'FAILED');

  if (!chatOk || !embedOk) {
    console.log('\nIf you saw API_KEY_INVALID: make sure the key is from https://aistudio.google.com/app/apikey');
    console.log('(not Google Cloud Console — that requires separate API enabling and billing setup)');
  }
})();