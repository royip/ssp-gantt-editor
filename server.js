/**
 * SSP Gantt Editor — Server
 *
 * Serves the static gantt-editor.html and provides two API endpoints
 * so all users see the same shared Gantt data:
 *
 *   GET  /api/gantt          → returns current gantt-data.json (public)
 *   POST /api/gantt          → saves new gantt-data.json (admin, password-protected)
 *   POST /api/admin/verify   → verifies the admin password (returns 200 or 401)
 *
 * Usage:
 *   npm install
 *   node server.js
 *
 * Configuration (environment variables):
 *   PORT                  → HTTP port (default: 3000)
 *   GANTT_ADMIN_PASSWORD  → admin password (default: 'password')
 *   GANTT_DATA_FILE       → path to the JSON data file (default: './gantt-data.json')
 */

const express  = require('express');
const fs       = require('fs');
const path     = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const PASSWORD = process.env.GANTT_ADMIN_PASSWORD || 'password';
const DATA_FILE = path.resolve(process.env.GANTT_DATA_FILE || './gantt-data.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.dirname(DATA_FILE) === path.resolve('.') ? '.' : __dirname));

// ── GET /api/gantt ──────────────────────────────────────────────────────────
// Returns the current Gantt state JSON to anyone (read-only users included).
app.get('/api/gantt', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json(null);   // no data yet — client will show empty state
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read Gantt data.' });
  }
});

// ── POST /api/gantt ─────────────────────────────────────────────────────────
// Saves new Gantt state. Requires correct admin password in the request body.
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
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write Gantt data: ' + e.message });
  }
});

// ── POST /api/admin/verify ──────────────────────────────────────────────────
// Lets the client check the password without sending data.
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
  console.log(`    Data file : ${DATA_FILE}`);
  console.log(`    Admin pw  : ${PASSWORD === 'password' ? '⚠️  default ("password") — change via GANTT_ADMIN_PASSWORD env var' : '(custom)'}`);
});
