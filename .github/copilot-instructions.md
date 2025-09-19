# Copilot Instructions for Blindtest App

## Project Overview
Blindtest App is a web-based musical quiz game for groups, featuring a Host (animateur) and Players (joueurs) organized in teams. The app consists of a React frontend and an Express backend (single repo, see `server.js`).

## Architecture & Key Files
- **Frontend (React, TypeScript):**
  - Entry: `src/index.tsx`, `src/App.tsx`
  - Host features: `src/host/HostDashboard.tsx`, `src/host/ScoreManager.ts`
  - Player features: `src/player/Buzzer.tsx`, `src/player/PlayerLobby.tsx`
  - Shared logic/types: `src/common/api.ts`, `src/common/types.ts`
  - Styles: CSS modules in each feature folder
- **Backend (Express, JS):**
  - Main server: `server.js` (serves API, manages game state)
- **Static assets:**
  - `public/buzz.mp3` (buzzer sound)
  - `public/index.html` (app entry)

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start backend:** `node server.js` (port 4000)
- **Start frontend:** `npm start` (port 3000)
- **No automated tests or build scripts detected.**
- **Debugging:**
  - Frontend: Use browser devtools, React error boundaries
  - Backend: Console logs in `server.js`

## Project-Specific Patterns
- **Game state is managed server-side in-memory (see `server.js`).**
- **Frontend communicates with backend via REST API (see `api.ts`).**
- **Polling is used for near real-time updates (no websockets).**
- **Buzzer logic:**
  - First player to buzz triggers sound and locks out others
  - Host can reset buzzers for new rounds
- **Teams and scores:**
  - Host can edit team names, scores, and remove players
  - Player state is synced via polling
- **Music playback is external (not controlled by app).**

## Conventions & Integration
- **TypeScript for frontend, JS for backend**
- **CSS Modules for styling**
- **No custom linting, formatting, or test conventions detected**
- **All game logic is centralized in `server.js` and `api.ts`**

## Examples
- To add a new game feature, update both `server.js` (API logic) and corresponding React component in `src/host` or `src/player`.
- For new API endpoints, document them in `api.ts` and update frontend calls accordingly.

---
**If any section is unclear or missing, please specify what needs improvement or additional detail.**
