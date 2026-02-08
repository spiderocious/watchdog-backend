# Watchdog Backend

Uptime monitoring API. Tracks endpoint health via scheduled HTTP checks with an in-process timer engine.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose 9)
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Caching:** node-cache (dashboard: 30s TTL)
- **Monitoring:** In-process `setInterval` per service (`Map<nodeId, Timeout>`)

## Setup

```bash
# install
npm install

# configure
cp .env.example .env
# requires: MongoDB running on localhost:27017

# dev (ts-node + nodemon)
npm run dev

# build + start
npm run build && npm start
```

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/watchdog
JWT_SECRET=<change-this>
JWT_EXPIRES_IN=24h
CACHE_TTL=3600
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## Architecture

4-layer: **Controller → Service → Repository → Model**

```
src/
├── configs/          # env, db, jwt, cache, cors
├── controllers/      # HTTP layer — parse req, call service, send response
├── services/         # Business logic — returns ServiceResult (never throws)
├── repositories/     # Data access — Mongoose queries
├── models/           # Mongoose schemas
├── routes/           # Express routers + validation chains
├── requests/         # express-validator rules
├── middlewares/      # auth (JWT), rate-limit, validation
├── monitoring/       # check-executor + monitoring-engine (timers)
├── shared/           # types, constants
├── utils/            # logger, response, jwt, cache, id, db, async-handler
├── app.ts            # Express app (middleware stack)
└── server.ts         # Entrypoint (db connect, engine start, graceful shutdown)
```

Services return `ServiceSuccess<T>` or `ServiceError` — controllers never catch exceptions from the service layer.

## API

15 endpoints. Full docs: [`doc/api-docs.md`](doc/api-docs.md)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/dashboard/overview` | Yes | Dashboard (cached 30s) |
| GET | `/api/services` | Yes | List services (paginated) |
| POST | `/api/services/test` | Yes | Test connection (pre-create) |
| POST | `/api/services` | Yes | Create service |
| GET | `/api/services/:service_id` | Yes | Service details + metrics |
| PATCH | `/api/services/:service_id` | Yes | Update service |
| DELETE | `/api/services/:service_id` | Yes | Delete service + history |
| POST | `/api/services/:service_id/pause` | Yes | Pause monitoring |
| POST | `/api/services/:service_id/resume` | Yes | Resume monitoring |
| POST | `/api/services/:service_id/test` | Yes | Manual test check |
| GET | `/api/system/status` | No | System status |
| GET | `/api/system/health` | No | Health check |

## Monitoring Engine

On startup, loads all active services from DB and starts a `setInterval` per service. Each tick:

1. HTTP request to the service endpoint (with configured method/headers/body)
2. Records a `HealthCheck` document (status code, response time, success/fail)
3. Tracks consecutive failures — sets status to `warning` at 2, `down` at threshold
4. Resets on success

Timers are managed via `MonitoringEngine.startNode()` / `stopNode()`, called automatically on create/pause/resume/delete.

## Scripts

```bash
npm run dev     # ts-node + nodemon (watch mode)
npm run build   # tsc → dist/
npm start       # node dist/server.js
npm run lint    # tsc --noEmit (type check only)
```
