# GEMINI.md

> Project instructions for Google Gemini / Antigravity Agent.
> Core architecture details & technical standards for **CT449 - MEVN Library Management System**.

## 1. Commands & Environment
- Backend Server: `cd BACKEND && npm start` (Port 3000)
- User Web: `cd frontend/user-web && npm run dev` (Port 5173)
- Admin Web: `cd frontend/admin-web && npm run dev` (Port 5174)
- Verification Tests: `node tests/run-api-tests.js` (Always verify 44/44 PASS)

## 2. Core Constraints
- **Strictly Native MongoDB**: Never install or import `mongoose`. Use `MongoDB.client.db().collection(...)`.
- **Redis Cache**: Evict relevant cache keys whenever mutations occur (`sach:*`, `muon:*`).
- **Vue 3 Dual SPAs**: Composition API with `<script setup>`, Pinia stores, Bootstrap 5.3.
- **Academic Rigor (`Cores/BaoCao.txt`)**: Strict scientific objectivity, Q1 journal / thesis standard, zero hyperbolic self-praise.
- **Karpathy Principles**:
  - Simplicity first: write minimal, robust code.
  - Surgical changes: touch only target lines; preserve existing formatting and comments.
  - Verifiable success criteria: loop until tests pass.

## 3. Session Lifecycle & `prompt.md` Protocol
- **Start of Session**: Read `Cores/checkpoint.md` and `Cores/next_step_guide.md` before taking actions.
- **After Task Completion**: Automatically follow `Cores/prompt.md`:
  1. Update `Cores/checkpoint.md` (append progress + generate Git commit message).
  2. Update `Cores/next_step_guide.md` (refresh next AI session prompt).
  3. Update `Cores/BaoCao.txt` (Q1 academic tone).
  4. Update `Cores/Chienluoc.md` (if schema changes).
  5. Update `README.md` (if notable CV feature).

Detailed documentation and multi-agent directives are maintained in [AGENTS.md](./AGENTS.md).

