# Personal AI Assistant with Persistent Memory

A personal AI assistant that remembers things about you across conversations. It runs as a small web API, stores its memory in a cloud database, and talks to a mobile app built with Expo.

Built from scratch using free tools only.

## What it does

- Chats with you using Google Gemini.
- Picks out facts worth remembering from your messages (for example, what you are learning or working on).
- Saves those facts with embeddings, so it can find the relevant ones later by meaning, not just by keywords.
- Adds the most relevant memories to every new reply, so the assistant feels like it knows you.
- Keeps its memory in a cloud database, so memory survives restarts and redeploys.
- Protects the chat endpoint with a secret key.

## How it works

For every message you send:

1. The server turns your message into an embedding and searches the saved facts for the 5 most similar ones.
2. It loads the last 8 messages of the conversation.
3. It builds a prompt from the system instructions, the relevant memories, the recent messages, and your new message.
4. Gemini writes the reply, and the server sends it back.
5. In the background, the server saves the exchange and asks Gemini to extract any lasting facts from your message. New facts are embedded and stored.

## Tech stack

| Part | Tool |
| --- | --- |
| Server | Node.js, Express |
| AI model | Google Gemini API (chat and embeddings) |
| Database | Turso (cloud SQLite) via `@libsql/client` |
| Hosting | Render (free tier) |
| Mobile app | Expo / React Native (separate repo: `personal-ai-app`) |

## Project structure

```
personal-ai/
├── server/index.js        Starts the server and checks the secret key
├── routes/chat.js         POST /chat: the main chat logic
├── memory/
│   ├── db.js              Database connection and tables
│   ├── gemini.js          Calls to the Gemini API (chat and embeddings)
│   ├── retrieval.js       Saving messages and facts, finding relevant facts
│   ├── extract.js         Extracts lasting facts from a message
│   └── test-db.js         Quick database connection test
├── cli.js                 Chat from the terminal
├── test-gemini.js         Checks that your Gemini key works
└── package.json
```

## Setup

You need Node.js 18 or newer, a free [Gemini API key](https://aistudio.google.com/app/apikey), and a free [Turso](https://turso.tech) database.

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project folder:

   ```
   GEMINI_API_KEY=your_gemini_key
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your_turso_token
   API_SECRET=a_long_random_string
   PORT=3000
   ```

   You can generate a random secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```

3. Check that the connections work:

   ```bash
   npm run test:gemini
   npm run test:db
   ```

4. Start the server:

   ```bash
   npm start
   ```

## API

### `POST /chat`

Send a message and get a reply.

Headers:

- `Content-Type: application/json`
- `x-api-secret: <your API_SECRET>`

Body:

```json
{ "message": "I am learning to build AI assistants" }
```

Response:

```json
{ "reply": "That's a great goal! ..." }
```

Requests without the correct secret get a `401 Unauthorized` response.

Example with PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/chat -Method Post `
  -ContentType "application/json" `
  -Headers @{"x-api-secret"="YOUR_SECRET"} `
  -Body '{"message": "Hello"}'
```

## Deployment

The server is deployed on Render's free tier:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `GEMINI_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `API_SECRET`

Render's free tier sleeps after a period of inactivity, so the first request after a quiet spell can take up to a minute. Memory is stored in Turso, so nothing is lost when the server sleeps or redeploys.

## Known limitations

- It is built for one user and uses a single shared secret, not user accounts.
- Memory search compares the question against every saved fact in the server's code. This is fine for a personal assistant but would not scale to a large number of facts.
- Facts are not de-duplicated yet, so similar facts can pile up over time.
- The assistant can only chat. It has no tools such as web search yet.

## Ideas for the future

- Remove duplicate or outdated facts.
- Add tools such as web search.
- Replace the shared secret with real login.
- Add a vector index for faster memory search.

## What I learned

- Language models do not remember anything by themselves. "Memory" comes from storing facts and retrieving the relevant ones for each prompt.
- Embeddings and cosine similarity make it possible to search by meaning.
- Free-tier hosting has trade-offs, such as servers that sleep and local files that disappear on redeploy, which is why the memory lives in a cloud database.
- Model names change over time, so test an API connection by itself before building on it.
