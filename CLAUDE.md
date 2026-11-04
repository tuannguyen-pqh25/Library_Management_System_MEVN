# CLAUDE.md

> Project instructions for Claude Code / Anthropic Assistant.
> Core architecture details & technical standards for **CT449 - MEVN Library Management System**.

## 1. Commands
- Run backend dev: `cd BACKEND && npm start`
- Run user-web: `cd frontend/user-web && npm run dev` (Port 5173)
- Run admin-web: `cd frontend/admin-web && npm run dev` (Port 5174)
- Run test suite: `node tests/run-api-tests.js` (Target: 44/44 tests PASS)
- Recreate indexes: `cd BACKEND && npm run db:indexes`

## 2. Karpathy Coding Guidelines
1. **Think Before Coding**: Explicit assumptions, surface tradeoffs, ask if ambiguous.
2. **Simplicity First**: Minimum viable code. No unnecessary abstractions, no unasked features.
3. **Surgical Changes**: Touch ONLY what is needed. Match existing style. Do NOT refactor adjacent code.
4. **Goal-Driven Execution**: Define verification criteria. Run `node tests/run-api-tests.js` to verify backend fixes.

## 3. Architecture & Strict Constraints
- **Database**: Strictly MongoDB Native Driver (`MongoDB.client.db().collection(...)`). **DO NOT USE MONGOOSE**.
- **Cache**: Redis caching (`app/utils/redis.util.js`). Invalidate cache on write operations (`delByPattern`).
- **Frontend**: Vue 3 `<script setup>`, Pinia, Bootstrap 5.3, Vee-Validate + Yup. Never add Tailwind or alternate UI libraries.
- **Namespaces**: Keep `/api/user/*` strictly separated from `/api/admin/*`.
- **Academic Writing (`Cores/BaoCao.txt`)**: When writing, updating, or reviewing academic documentation, enforce a strict academic/Q1 research paper tone: 100% objective, evidence-based, zero self-praise or marketing buzzwords, and quantitatively grounded.

## 4. Session Lifecycle & `prompt.md` Protocol
- **Start of Session**: Read `Cores/checkpoint.md` and `Cores/next_step_guide.md` before taking actions.
- **After Task Completion**: Automatically follow `Cores/prompt.md`:
  1. Update `Cores/checkpoint.md` (append progress + generate Git commit message).
  2. Update `Cores/next_step_guide.md` (refresh next AI session prompt).
  3. Update `Cores/BaoCao.txt` (Q1 academic tone).
  4. Update `Cores/Chienluoc.md` (if schema changes).
  5. Update `README.md` (if notable CV feature).

Refer to [AGENTS.md](./AGENTS.md) for full system specifications.

