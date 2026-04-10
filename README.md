# SSP Gantt Editor

A self-contained, single-file interactive Gantt chart editor built for the Start.io Modernized SSP project. No build step, no dependencies — open the HTML file in any browser and start editing.

## Features

- **Visual Gantt chart** — drag and resize task bars directly on the timeline
- **Task management** — add, edit, and delete tasks with full metadata: name, status, ticket ID, date range, more info, and comments
- **Dependency tracking** — link tasks as "blocks" or "blocked by" with visual SVG dependency lines
- **Group/swim-lane layout** — organize tasks into color-coded groups with collapsible rows
- **Milestones** — add milestone markers with custom labels and colors
- **Custom statuses** — define your own status types with colors beyond the built-in set
- **Autosave** — all changes persist to `localStorage` and auto-save to a local JSON file (400ms debounce)
- **Import / Export** — load and save Gantt data as JSON; shareable across team members
- **Column pinning** — pin/unpin the label column for wide timelines
- **Hover tooltips** — quick task info on hover (toggleable via Settings)
- **Dark toolbar UI** — clean, minimal interface designed for focused planning

## Usage

1. Open `gantt-editor.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. Use the toolbar to add groups, tasks, and milestones
3. Click any bar or task label to edit — including dependencies, ticket IDs, notes, and comments
4. Use **Save / Load JSON** to export or import Gantt data
5. Data autosaves to `localStorage` — your work is preserved on refresh

## Data Model

Tasks are stored as JSON with the following structure:

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

`s` and `e` are month-unit positions (0.5 = mid-month).

## Deployment

This is a single HTML file with no external runtime dependencies. It can be served from any static web host:

- Drop `gantt-editor.html` onto any web server or static hosting (S3, Nginx, GitHub Pages, etc.)
- No Node.js, no build pipeline, no database required
- For team-shared state, pair with a backend endpoint that reads/writes the JSON save file

## Tech Stack

- Vanilla JavaScript (ES2020+)
- SVG for dependency lines
- CSS Grid / Flexbox layout
- `localStorage` + File System Access API for persistence

## Project Context

Built for the [Start.io](https://start.io) Modernized SSP project (codename: RNS) to support milestone planning across Backend, Frontend, Data, Algo, DevOps, and QA teams.

Milestones: M1 (June 2026) · M1.5 (September 2026) · M2 (December 2026)
