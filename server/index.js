// server/index.js
// Entry point: starts the Express server.

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const chatRouter = require('../routes/chat');
const { init } = require('../memory/db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/chat', chatRouter);

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
