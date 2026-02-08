# Watchdog MVP — Implementation Guide

## Tech Stack

**Runtime:** Node.js + TypeScript
**Database:** MongoDB + Mongoose
**Cache:** node-cache
**Auth:** JWT (bcrypt for passwords)
**Validation:** express-validator

### Framework: Express (Recommended for MVP)

| | Express | Fastify | Hono |
|---|---------|---------|------|
| Maturity | 10+ years, battle-tested | Mature, production-ready | Newer, edge-first |
| Ecosystem | Massive (middleware, guides, hiring) | Good, growing | Small for Node.js servers |
| TypeScript | Works fine with @types | Good native support | Excellent native support |
| Performance | Slowest of the three | ~2-3x faster than Express | Fastest, but edge-optimized |
| Learning curve | Everyone knows it | Small adjustment | Different paradigm |

**Verdict:** Express. For an MVP, ecosystem and familiarity beat raw performance. The bottleneck will be MongoDB queries and outbound HTTP checks, not framework overhead. Fastify is a reasonable alternative if you want something more modern — but Hono is designed for edge/serverless and is the wrong fit here.

---

## Project Structure

Following the Controller → Service → Repository → Model pattern from the architecture guide:

```
src/
├── server.ts
├── app.ts
├── configs/           # env, db, jwt, cache configs
├── controllers/       # auth, service, dashboard controllers
├── services/          # auth, service, monitoring, dashboard services
├── repositories/      # user, service, healthCheck repositories
├── models/            # User, Service, HealthCheck models
├── routes/            # auth, service, dashboard routes
├── middlewares/        # auth, validateRequest, rateLimit
├── requests/          # validation schemas per entity
├── shared/
│   ├── types/         # IUser, IService, IHealthCheck, ServiceResult
│   └── constants/     # HTTP_STATUS, MESSAGE_KEYS
├── utils/             # response, logger, asyncHandler, jwt, id, cache
└── monitoring/        # MonitoringEngine (scheduler + check executor)
```

## Data Models

**User** — `id`, `email`, `password (select:false)`, `full_name`, `timestamps`

**Service** — `id`, `userId (ref)`, `name`, `endpoint_url`, `method`, `headers?`, `body?`, `check_interval`, `expected_status_codes`, `failure_threshold`, `status (active|paused|down|warning)`, `consecutive_failures`, `last_check_at`, `timestamps`

**HealthCheck** — `id`, `serviceId (ref)`, `status_code`, `response_time`, `success`, `status_text`, `error_message?`, `timestamp`. Indexed on `{ serviceId: 1, timestamp: -1 }` for fast lookups.

---

## Monitoring Engine — Background Job Options

This is the core question: how do we schedule and run periodic HTTP checks?

### Option A: In-Process Timer Manager (Recommended for MVP)

A `MonitoringEngine` singleton that holds a `Map<serviceId, NodeJS.Timeout>`. On service create → start a `setInterval`. On pause → `clearInterval`. On resume → restart. On delete → clear.

```
Pros: Zero dependencies, dead simple, instant start/stop per service
Cons: Lost on process restart, single-process only, no retry logic
```

**This is the MVP pick.** When the server starts, load all active services from DB and start their timers. If the process crashes, timers restart on boot. Good enough for hundreds of services.

### Option B: Agenda.js (MongoDB-backed)

Uses your existing MongoDB as the job store. Persistent jobs survive restarts. Built-in retry, concurrency control, and cron scheduling.

```
Pros: Persistent, retries, uses existing MongoDB, no new infra
Cons: Polls MongoDB (adds DB load), slightly more complex setup
```

**Good upgrade path** when you outgrow Option A. No new infrastructure needed.

### Option C: BullMQ (Redis-backed)

Production-grade job queue. Repeatable jobs, priority queues, rate limiting, dashboard (Bull Board).

```
Pros: Best performance, best features, real concurrency, scales to millions
Cons: Requires Redis (new infra), overkill for MVP
```

**The long-term answer** when you need multi-worker, multi-region. Not worth the Redis dependency right now.

### Option D: node-cron

Cron-style scheduling (`*/30 * * * * *`). Simple but all jobs run on fixed cron schedules, not per-service intervals. Awkward fit when each service has its own interval.

```
Verdict: Poor fit. Per-service intervals don't map well to cron syntax.
```

### Recommendation

**Start with Option A** (in-process timers). It covers the MVP perfectly. When you need persistence or are running 1000+ services, migrate to **Option B** (Agenda.js) — it's a straightforward swap since both just call the same `executeCheck()` function. Leave BullMQ for when you actually need horizontal scaling.

---

## Implementation Order

1. **Project scaffold** — tsconfig, package.json, path aliases, folder structure
2. **Shared layer** — types, constants, ServiceResult, ResponseUtil, logger, asyncHandler
3. **Database** — MongoDB connection, User model, Service model, HealthCheck model
4. **Auth** — register, login, JWT middleware, GET /me
5. **Services CRUD** — create, read, update, delete, list (with pagination/search/filter)
6. **Monitoring engine** — timer manager, HTTP check executor, result storage
7. **Pause/Resume/Test** — service actions that control the monitoring engine
8. **Dashboard** — aggregate queries over services + health checks, cache with node-cache
9. **System status** — simple public endpoint

---

## Key Implementation Notes

- **Check executor**: Use `fetch()` (native in Node 18+). Build request from service config, measure response time with `performance.now()`, store result in HealthCheck collection.
- **Consecutive failure tracking**: Increment `consecutive_failures` on the Service document on fail, reset to 0 on success. Update `status` accordingly (active/warning/down based on threshold).
- **Dashboard caching**: The dashboard overview is expensive (aggregates across all services). Cache it in node-cache with a 30s TTL — matches the auto-refresh interval.
- **Service list overview stats**: Compute `uptime_avg`, `latency_avg`, `critical_count` from cached/aggregated data, not live queries on every request.
