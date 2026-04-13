/**
 * SSP Gantt Editor — Server
 *
 * Run from inside the folder that contains gantt-editor.html and your JSON file.
 *
 *   GET  /api/gantt          → returns current data file (public, read-only users)
 *   POST /api/gantt          → saves data file (admin, password-protected)
 *   POST /api/admin/verify   → verifies admin password (200 or 401)
 *   GET  /api/updates        → SSE stream — pushes 'updated' event to all connected
 *                              clients whenever admin saves; read-only users auto-reload
 *
 * Usage:
 *   npm install
 *   PORT=3333 node server.js
 *
 * Configuration (environment variables):
 *   PORT                  → HTTP port (default: 3000)
 *   GANTT_ADMIN_PASSWORD  → admin password (default: 'password')
 *   GANTT_DATA_FILE       → path to the JSON data file (default: auto-detected,
 *                           looks for ssp-gantt.json then gantt-data.json in cwd)
 */

const express  = require('express');
const fs       = require('fs');
const path     = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const PASSWORD = process.env.GANTT_ADMIN_PASSWORD || 'password';

// Auto-detect data file: prefer ssp-gantt.json, fall back to gantt-data.json
function resolveDataFile() {
  if (process.env.GANTT_DATA_FILE) return path.resolve(process.env.GANTT_DATA_FILE);
  const preferred = path.resolve('./ssp-gantt.json');
  if (fs.existsSync(preferred)) return preferred;
  return path.resolve('./gantt-data.json');
}
const DATA_FILE = resolveDataFile();

// ── SSE: connected read-only clients ────────────────────────────────────────
const sseClients = new Set();

function broadcastUpdate() {
  sseClients.forEach(res => res.write('data: updated\n\n'));
}

app.use(express.json({ limit: '10mb' }));

// Serve static files from cwd (where gantt-editor.html lives)
app.use(express.static('.'));

// Root → serve gantt-editor.html directly
app.get('/', (req, res) => {
  const htmlFile = path.resolve('gantt-editor.html');
  if (fs.existsSync(htmlFile)) {
    res.sendFile(htmlFile);
  } else {
    res.status(404).send('gantt-editor.html not found. Make sure you are running server.js from the folder that contains it.');
  }
});

// ── GET /api/updates ─────────────────────────────────────────────────────────
// SSE stream — clients subscribe once and receive a push whenever admin saves.
app.get('/api/updates', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  // Send an initial ping so the client knows the connection is live
  res.write(':connected\n\n');

  sseClients.add(res);

  // Keep-alive ping every 25s (prevents proxies/browsers from closing idle connections)
  const keepAlive = setInterval(() => res.write(':ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// ── GET /api/gantt ──────────────────────────────────────────────────────────
app.get('/api/gantt', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json(null);
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read Gantt data.' });
  }
});

// ── POST /api/gantt ─────────────────────────────────────────────────────────
app.post('/api/gantt', (req, res) => {
  const { password, data } = req.body || {};
  if (!password || password !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized — wrong password.' });
  }
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid data payload.' });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    broadcastUpdate();   // ← notify all connected read-only clients instantly
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write Gantt data: ' + e.message });
  }
});

// ── POST /api/admin/verify ──────────────────────────────────────────────────
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body || {};
  if (password === PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Wrong password.' });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  SSP Gantt Editor running at http://localhost:${PORT}`);
  console.log(`    Data file : ${DATA_FILE}${fs.existsSync(DATA_FILE) ? '' : '  ⚠️  (not found yet — created on first admin save)'}`);
  console.log(`    Admin pw  : ${PASSWORD === 'password' ? '⚠️  default ("password") — change via GANTT_ADMIN_PASSWORD env var' : '(custom)'}`);
});
