// server/index.js
require('dotenv').config();
const path = require('node:path');
const express = require('express');
const chatRouter = require('../routes/chat');
const { init } = require('../memory/db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function requireSecret(req, res, next) {
  const secret = process.env.API_SECRET;
  if (!secret || req.headers['x-api-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
app.use('/chat', requireSecret, chatRouter);

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