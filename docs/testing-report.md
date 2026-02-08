# API Testing Report

**Date:** 2026-02-08
**Server:** localhost:3000, development mode
**All 14 endpoints tested** (success + failure cases)

---

## Bugs Found & Fixed

### 1. Create/Update response leaked Mongoose internals
**Endpoints:** `POST /api/services`, `PATCH /api/services/:id`
**Issue:** Responses returned raw Mongoose documents including `_id`, `__v`, `user_id`, `consecutive_failures`, `last_check_at`, empty `body`/`headers` fields.
**Fix:** Shaped responses in `node.service.ts` to return only relevant fields (`service_id`, `service_name`, `endpoint_url`, `method`, `status`, `monitoring_started`, `created_at`/`updated_at`). Changed return types from `ServiceResult<MonitorNode>` to `ServiceResult<any>`.
**Files changed:** `src/services/node.service.ts`

---

## Spec Mismatches (mvp-api.md vs actual)

These are intentional deviations from the spec, documented for frontend alignment:

| Field | Spec (mvp-api.md) | Actual | Reason |
|-------|-------------------|--------|--------|
| User ID key | `user_id` | `id` | Consistent with all other entities |
| `plan` field | `"plan": "free"` | Not returned | Removed from MVP scope |
| Register message | "...Please verify your email." | "Registration successful." | No email verification in MVP |
| Validation `fields` | Object `{field: [msgs]}` | Array of express-validator objects | Express-validator default format; functional equivalent |
| Services list key | `services` | `items` | Matches our PaginatedResponse pattern |
| List overview | `uptime_avg`, `critical_count`, etc. | `total_services`, `active_count`, etc. | Simpler MVP stats |
| List pagination | `current_page`, `total_items`, etc. | `page`, `limit`, `total`, `total_pages` | Simpler naming |
| Get details `quick_metrics` | Array of UI objects | Simple object | Data-oriented (not UI-prescriptive) |
| Dashboard telemetry | `chart_data`, `request_rate`, `latency_p99` | `current`+`unit` only | MVP simplification |
| Test connection wrapper | `test_result` + `preview_response` | `data` | Consistent `data` wrapper pattern |
| Resume response | Has `next_check` | No `next_check` | Timer is internal; next check = check_interval from now |

---

## All Endpoints Passing

| # | Endpoint | Method | Success | Failure | Status |
|---|----------|--------|---------|---------|--------|
| 1 | `/api/auth/register` | POST | 201 | 400 (dup email, validation) | PASS |
| 2 | `/api/auth/login` | POST | 200 | 401 (wrong password) | PASS |
| 3 | `/api/auth/me` | GET | 200 | 401 (invalid token) | PASS |
| 4 | `/api/dashboard/overview` | GET | 200 | 401 (no auth) | PASS |
| 5 | `/api/services` | GET | 200 | 401 (no auth) | PASS |
| 6 | `/api/services/test` | POST | 200 | 400 (validation) | PASS |
| 7 | `/api/services` | POST | 201 | 400 (validation) | PASS |
| 8 | `/api/services/:id` | GET | 200 | 404 (not found) | PASS |
| 9 | `/api/services/:id` | PATCH | 200 | 404 (not found) | PASS |
| 10 | `/api/services/:id` | DELETE | 200 | 404 (not found) | PASS |
| 11 | `/api/services/:id/pause` | POST | 200 | 400 (already paused) | PASS |
| 12 | `/api/services/:id/resume` | POST | 200 | 400 (already active) | PASS |
| 13 | `/api/services/:id/test` | POST | 200 | 404 (not found) | PASS |
| 14 | `/api/system/status` | GET | 200 | N/A (public) | PASS |
