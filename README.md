# SSP Gantt Editor

A single-file interactive Gantt chart editor with a lightweight Node.js server for shared, real-time team access.

## Features

- **Visual Gantt chart** — drag and resize task bars directly on the timeline
- **Task management** — add, edit, and delete tasks with full metadata: name, status, ticket ID, date range, more info, and comments
- **Dependency tracking** — link tasks as "blocks" or "blocked by" with visual SVG dependency lines
- **Group/swim-lane layout** — organize tasks into color-coded groups with collapsible rows
- **Milestones** — add milestone markers with custom labels and colors
- **Custom statuses** — define your own status types with colors beyond the built-in set
- **Autosave** — all changes persist automatically (400ms debounce) to the server JSON file
- **Read-only mode** — team members open the page and see the latest Gantt live, with no editing access
- **Admin mode** — password-protected editing; all changes broadcast instantly to all connected viewers via SSE
- **Live updates** — read-only browsers update automatically when admin saves, no manual refresh needed
- **Column pinning** — pin/unpin the label column for wide timelines
- **Hover tooltips** — quick task info on hover (toggleable via Settings)

## Files

| File | Purpose |
|------|---------|
| `gantt-editor.html` | The full application — UI, logic, and styles in one file |
| `server.js` | Node.js/Express server — serves the app and handles shared Gantt data |
| `package.json` | Node.js dependencies (`express`) |
| `ssp-gantt.json` | Gantt data file — auto-detected by the server, created on first admin save |

## Server Setup (Required for Shared/Team Use)

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher (includes npm)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/royip/ssp-gantt-editor.git
cd ssp-gantt-editor

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

The server starts on port 3000 by default. Open `http://localhost:3000` in your browser.

### Configuration (environment variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port to listen on |
| `GANTT_ADMIN_PASSWORD` | `password` | Password for admin edit access — **change this in production** |
| `GANTT_DATA_FILE` | auto-detected | Path to the JSON data file. Defaults to `ssp-gantt.json` if present, otherwise `gantt-data.json` |

Example with custom settings:

```bash
PORT=3333 GANTT_ADMIN_PASSWORD=mysecretpw node server.js
```

## Usage

### For read-only viewers (team members)
1. Open the URL in any browser
2. Click **☁️ View Latest** in the toolbar — or click **View Latest Gantt** in the welcome modal
3. The Gantt loads in read-only mode and updates automatically whenever the admin saves

### For the admin (Gantt owner)
1. Open the URL in your browser
2. Click **☁️ View Latest** to load the latest server state
3. Click the **🔒** button in the toolbar and enter the admin password
4. Edit freely — all changes auto-save to the server and broadcast to viewers instantly

### Publishing your current Gantt to the server
If you have a local Gantt (from a previous standalone session), save it to the data file first before switching to server mode:
1. Click **💾** in the toolbar to save to `ssp-gantt.json`
2. Then click **☁️ View Latest** → 🔒 to enter admin mode

### Updating the data file in Git
```bash
git add ssp-gantt.json && git commit -m "Update Gantt data" && git push
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/gantt` | None | Returns current Gantt JSON |
| `POST` | `/api/gantt` | Password in body | Saves new Gantt JSON, broadcasts update to all viewers |
| `POST` | `/api/admin/verify` | — | Verifies admin password |
| `GET` | `/api/updates` | None | SSE stream — pushes `updated` event to all connected read-only clients on every admin save |

## Data Model

Tasks are stored as JSON:

```json
{
  "id": "unique-id",
  "label": "Task name",
  "g": "group-id",
  "gs": ["group-id"],
  "s": 0,
  "e": 1,
  "st": "wip",
  "tk": "RNS-42",
  "moreInfo": "Optional context, links, or background notes",
  "comments": "Team notes or commentary",
  "blocks": ["other-task-id"],
  "blockedBy": ["another-task-id"]
}
```

`s` and `e` are month-unit positions (0 = month start, 0.5 = mid-month, 1 = month end).

## Tech Stack

- Vanilla JavaScript (ES2020+), no frontend build step
- Node.js + Express for the server
- SVG for dependency lines
- Server-Sent Events (SSE) for live updates
- CSS Grid / Flexbox layout
- `localStorage` + File System Access API for standalone (offline) persistence

## Project Context

Built for the [Start.io](https://start.io) Modernized SSP project (codename: RNS) to support milestone planning across Backend, Frontend, Data, Algo, DevOps, and QA teams.

Milestones: M1 (June 2026) · M1.5 (September 2026) · M2 (December 2026)
