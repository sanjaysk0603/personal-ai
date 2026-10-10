// memory/test-db.js
// Quick sanity check that the Turso connection + schema works.
// Usage: node memory/test-db.js

const { db, init } = require('./db');

(async () => {
  await init();

  await db.execute({
    sql: 'INSERT INTO messages (role, content) VALUES (?, ?)',
    args: ['user', 'Hello, this is a Turso test message.'],
  });

  const messages = await db.execute('SELECT * FROM messages');
  console.log('✅ messages table works. Rows:', messages.rows);

  await db.execute({
    sql: 'INSERT INTO facts (content, embedding) VALUES (?, ?)',
    args: ['Test fact', JSON.stringify([0.1, 0.2, 0.3])],
  });

  const facts = await db.execute('SELECT id, content FROM facts');
  console.log('✅ facts table works. Rows:', facts.rows);
})();
