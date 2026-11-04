# GitHub Copilot / Codex Project Instructions

Project: **CT449 - Quản Lý Đăng Ký Mượn Trả Sách Trực Tuyến (MEVN Stack)**

## Critical Architecture Guardrails
1. **NO MONGOOSE**: Always use the native MongoDB driver (`MongoDB.client.db().collection('Name')`).
2. **REDIS SYNC**: Any create/update/delete operation on books, categories, or loans must invalidate matching Redis cache keys.
3. **ATOMIC INVENTORY**: Use MongoDB atomic operators (`$inc`, `$set`, session transactions) when reserving or returning books to prevent race conditions.
4. **VUE 3 FRONTEND**: Dual SPAs (`user-web` and `admin-web`). Always use `<script setup>` Composition API, Pinia, and Bootstrap 5.3.
5. **TESTS**: Always verify changes against `tests/run-api-tests.js` (44 test suites).
6. **ACADEMIC RIGOR**: When drafting or editing `Cores/BaoCao.txt`, use strictly objective, peer-reviewed Q1 paper style. Never use marketing adjectives or self-praise.
7. **SESSION LIFECYCLE**: At start of session, read `Cores/checkpoint.md` and `Cores/next_step_guide.md`. Upon completing a feature, update `Cores/checkpoint.md`, `Cores/next_step_guide.md`, `Cores/BaoCao.txt`, and provide a Git commit message as required by `Cores/prompt.md`.
8. **SURGICAL CHANGES**: Touch only code directly requested by the user. Do not reformat or refactor unrelated files.

See `AGENTS.md` for full instructions.

