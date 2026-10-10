// cli.js
// Simple command-line chat loop — talk to your assistant without curl.
// Usage: node cli.js
// Type "exit" to quit.

const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SERVER_URL = 'http://localhost:3000/chat';

console.log('🤖 Personal AI — type a message (or "exit" to quit)\n');

function ask() {
  rl.question('You: ', async (input) => {
    if (input.trim().toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const res = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();

      if (!res.ok) {
        console.log('❌ Error:', data.error || data);
      } else {
        console.log('AI:', data.reply, '\n');
      }
    } catch (err) {
      console.log('❌ Could not reach server. Is it running? (npm start in another terminal)');
    }

    ask();
  });
}

ask();
