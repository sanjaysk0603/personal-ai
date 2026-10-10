// memory/retrieval.js
// Handles saving messages/facts and finding relevant memories by
// cosine similarity (done in JS since we compare embeddings manually).

const { db } = require('./db');
const { embed } = require('./gemini');

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function saveMessage(role, content) {
  await db.execute({
    sql: 'INSERT INTO messages (role, content) VALUES (?, ?)',
    args: [role, content],
  });
}

async function getRecentMessages(limit = 8) {
  const result = await db.execute({
    sql: 'SELECT role, content FROM messages ORDER BY id DESC LIMIT ?',
    args: [limit],
  });
  return result.rows.reverse(); // oldest first
}

async function saveFact(content) {
  const vector = await embed(content);
  await db.execute({
    sql: 'INSERT INTO facts (content, embedding) VALUES (?, ?)',
    args: [content, JSON.stringify(vector)],
  });
}

async function getRelevantFacts(query, topK = 5) {
  const queryVector = await embed(query);
  const result = await db.execute('SELECT content, embedding FROM facts');

  const scored = result.rows.map(f => ({
    content: f.content,
    score: cosineSimilarity(queryVector, JSON.parse(f.embedding)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.content);
}

module.exports = { saveMessage, getRecentMessages, saveFact, getRelevantFacts };
