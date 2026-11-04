---
name: test-driven-verifier
description: Executes and validates the 44 automated integration tests for the CT449 library management backend. Use when modifying APIs, fixing bugs, updating controllers or database queries to verify 100% test pass rate.
---

# Test-Driven Verifier for CT449

This skill guides the agent in running, interpreting, and debugging the automated API integration test suite for the CT449 MEVN library management system.

---

## 1. When to Use

Activate this skill whenever:
- Modifying backend routes, controllers, services, or middleware in `BACKEND/`.
- Fixing inventory, borrowing, approval, or return logic.
- Verifying Redis cache invalidation or RBAC permission changes.
- Preparing to complete a backend task.

---

## 2. Test Execution Command

The test suite is located at [tests/run-api-tests.js](file:///d:/Project/CT449/Project/tests/run-api-tests.js).

### Step 1: Ensure Backend Server is Running
In PowerShell:
```powershell
# From project root
cd BACKEND
npm start
```
*(Backend must be active on `http://localhost:3000`)*

### Step 2: Run the Automated Test Suite
From the project root:
```powershell
node tests/run-api-tests.js
```
Or execute the helper batch script:
```powershell
.\tests\run-tests.bat
```

---

## 3. Interpreting Output & Target Metric

- **Target Metric:** `44/44 PASS (100%)` in ~1.2 seconds.
- Test suites covered:
  - `[TC_AUTH_U]`: Reader registration, login, JWT token generation, duplicate email rejection.
  - `[TC_AUTH_A]`: Staff/Admin authentication, role claims in JWT.
  - `[TC_RBAC]`: Role-based access control (Admin vs Staff vs Reader).
  - `[TC_SACH]`: Book listing, filtering by category/publisher, search, pagination.
  - `[TC_KHO]`: Stock validation, atomic quantity decrement, race-condition protection.
  - `[TC_MUON]`: Loan request lifecycle (Pending -> Approved -> Borrowed -> Returned).
  - `[TC_CACHE]`: Redis in-memory cache hit (1-2ms) and automatic invalidation on update.

---

## 4. Debugging Failures

If any test outputs `FAIL`:
1. **Identify the Test Case ID**: Locate the failing step number and test tag (e.g. `[TC_MUON_03]`).
2. **Review Test Specification**: Look up the expected behavior in [tests/01_KICH_BAN_KIEM_THU_TONG_THE.md](file:///d:/Project/CT449/Project/tests/01_KICH_BAN_KIEM_THU_TONG_THE.md).
3. **Check Prerequisites**:
   - Is Redis running? (`redis-cli ping` → `PONG`)
   - Is MongoDB running?
   - Was test data altered? You can re-seed test data:
     ```powershell
     cd BACKEND
     node seedData.js
     ```
4. **Apply Surgical Fix**: Fix the exact controller or service line causing the failure.
5. **Re-run Tests**: Run `node tests/run-api-tests.js` again until 44/44 tests pass.

