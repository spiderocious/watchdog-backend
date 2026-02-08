# Watchdog API Documentation

**Base URL:** `http://localhost:3000`
**Auth:** Bearer token via `Authorization: Bearer <token>` header
**Content-Type:** `application/json` for all request bodies

---

## 1. Authentication

### 1.1 Register

`POST /api/auth/register`

**Auth:** None

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| full_name | string | Yes | 2-50 characters |
| email | string | Yes | Valid email format |
| password | string | Yes | 8+ characters |

```json
{
  "full_name": "Doc Test User",
  "email": "doctest@watchdog.test",
  "password": "DocTestPass123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "usr_5c8fa623",
      "email": "doctest@watchdog.test",
      "full_name": "Doc Test User",
      "created_at": "2026-02-08T17:01:49.379Z",
      "updated_at": "2026-02-08T17:01:49.379Z"
    },
    "access_token": "eyJhbG...",
    "refresh_token": "rt_976841e6b4234a62",
    "expires_in": 86400
  }
}
```

**Error — Duplicate Email (400):**

```json
{
  "success": false,
  "error": "EMAIL_TAKEN",
  "message": "This email is already registered"
}
```

**Error — Validation (400):**

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Full name must be between 2 and 50 characters",
  "fields": [
    {
      "type": "field",
      "value": "",
      "msg": "Full name must be between 2 and 50 characters",
      "path": "full_name",
      "location": "body"
    },
    {
      "type": "field",
      "value": "bad",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "value": "12",
      "msg": "Password must be at least 8 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

---

### 1.2 Login

`POST /api/auth/login`

**Auth:** None

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

```json
{
  "email": "john@watchdog.test",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_da86c3b1",
      "email": "john@watchdog.test",
      "full_name": "John Doe",
      "created_at": "2026-02-08T16:39:24.406Z",
      "updated_at": "2026-02-08T16:39:24.406Z"
    },
    "access_token": "eyJhbG...",
    "refresh_token": "rt_05d1e3e649c2679a",
    "expires_in": 86400
  }
}
```

**Error — Wrong Credentials (401):**

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

### 1.3 Get Current User

`GET /api/auth/me`

**Auth:** Bearer token

**Success Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "usr_da86c3b1",
    "email": "john@watchdog.test",
    "full_name": "John Doe",
    "created_at": "2026-02-08T16:39:24.406Z",
    "updated_at": "2026-02-08T16:39:24.406Z"
  }
}
```

---

## 2. Dashboard

### 2.1 Get Dashboard Overview

`GET /api/dashboard/overview`

**Auth:** Bearer token
**Cache:** 30 seconds

**Success Response (200):**

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "services_overview": [
      {
        "id": "srv_3f0d2fa2",
        "status": "active",
        "name": "Watchdog Self-Health",
        "endpoint": "http://localhost:3000/api/system/health",
        "method": "GET",
        "interval": 30000,
        "uptime_percentage": 100,
        "avg_response": 9,
        "last_check": "2026-02-08T17:01:23.410Z",
        "failure_count": 0,
        "success_count": 16
      }
    ],
    "real_time_telemetry": {
      "response_time": {
        "current": 722,
        "unit": "ms",
        "threshold": 3000,
        "chart_data": [
          { "timestamp": "18:56:30", "value": 561.5 },
          { "timestamp": "18:57:00", "value": 567.3 },
          { "timestamp": "18:57:30", "value": 786.5 },
          { "timestamp": "18:58:00", "value": 532.5 },
          { "timestamp": "18:58:30", "value": 490.3 }
        ]
      },
      "request_rate": {
        "current": 4,
        "unit": "QPM",
        "threshold": 600,
        "chart_data": [
          { "timestamp": "18:56:30", "value": 8 },
          { "timestamp": "18:57:00", "value": 8 },
          { "timestamp": "18:57:30", "value": 8 },
          { "timestamp": "18:58:00", "value": 8 },
          { "timestamp": "18:58:30", "value": 8 }
        ]
      },
      "error_rate": {
        "current": 0,
        "unit": "%",
        "threshold": 1.0,
        "chart_data": [
          { "timestamp": "18:56:30", "value": 0 },
          { "timestamp": "18:57:00", "value": 0 },
          { "timestamp": "18:57:30", "value": 0 },
          { "timestamp": "18:58:00", "value": 0 },
          { "timestamp": "18:58:30", "value": 0 }
        ]
      },
      "latency_p99": {
        "current": 1437,
        "unit": "ms",
        "threshold": 200,
        "chart_data": [
          { "timestamp": "18:56:30", "value": 1145 },
          { "timestamp": "18:57:00", "value": 1452 },
          { "timestamp": "18:57:30", "value": 1891 },
          { "timestamp": "18:58:00", "value": 1254 },
          { "timestamp": "18:58:30", "value": 1078 }
        ]
      }
    },
    "service_diagnostics": {
      "check_logs": [
        {
          "id": "chk_8514dce6f624",
          "node_id": "srv_8db6467a",
          "status_code": 200,
          "status_text": "OK",
          "response_time": 1026,
          "success": true,
          "error_message": "",
          "created_at": "2026-02-08T17:01:24.413Z"
        }
      ]
    },
    "error_logs": [],
    "status_overview": {
      "total_services": 2,
      "active": 2,
      "down": 0,
      "warning": 0,
      "paused": 0,
      "monitoring_active": true
    },
    "metadata": {
      "timestamp": "2026-02-08T17:01:39.412Z",
      "system_status": "operational"
    }
  }
}
```

**Notes:**
- `services_overview` returns up to 6 services
- `real_time_telemetry` — last 5 minutes of data bucketed into 30s intervals
  - `response_time` — average response time across all services per bucket
  - `request_rate` — checks per bucket scaled to QPM (queries per minute)
  - `error_rate` — `(failed / total) * 100` per bucket
  - `latency_p99` — 99th percentile response time per bucket (MongoDB `$percentile`)
  - `threshold` — configurable alert threshold for each metric
  - `chart_data[].timestamp` — formatted as `HH:MM:SS`
- `service_diagnostics.check_logs` returns the 10 most recent successful checks
- `error_logs` contains only failed checks (up to 10)
- `status_overview.monitoring_active` is `true` if any service is active

---

## 3. Services

### 3.1 List Services

`GET /api/services`

**Auth:** Bearer token

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| page | int | 1 | >= 1 |
| limit | int | 10 | 1-100 |
| search | string | — | Text search on service name |
| status | string | — | `active`, `down`, `warning`, `paused` |
| sort_by | string | — | `name`, `uptime`, `last_check`, `created_at` |
| sort_order | string | — | `asc`, `desc` |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Services fetched successfully",
  "data": {
    "overview": {
      "total_services": 2,
      "active_count": 2,
      "down_count": 0,
      "warning_count": 0,
      "paused_count": 0
    },
    "items": [
      {
        "id": "srv_3f0d2fa2",
        "status": "active",
        "name": "Watchdog Self-Health",
        "endpoint": "http://localhost:3000/api/system/health",
        "method": "GET",
        "interval": 30000,
        "uptime_percentage": 100,
        "avg_response": 9,
        "last_check": "2026-02-08T17:01:23.410Z",
        "failure_count": 0,
        "success_count": 16
      }
    ],
    "page": 1,
    "limit": 5,
    "total": 2,
    "total_pages": 1
  }
}
```

**Notes:**
- `overview` counts are across ALL user services (not filtered by query params)
- `items[].last_check` is `null` if no check has run yet
- `items[].avg_response` is in milliseconds, 0 if no checks yet
- `items[].uptime_percentage` is 100 if no checks yet (no failures = 100%)

---

### 3.2 Test Connection (Pre-Create)

`POST /api/services/test`

**Auth:** Bearer token

**Request Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| endpoint_url | string | Yes | Valid HTTP/HTTPS URL |
| method | string | No | Default: `GET`. Options: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| headers | object | No | Key-value pairs |
| body | string | No | For POST/PUT/PATCH methods |

```json
{
  "endpoint_url": "https://httpbin.org/get",
  "method": "GET"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Connection test successful",
  "data": {
    "status_code": 200,
    "status_text": "OK",
    "response_time": 580,
    "response_time_unit": "ms",
    "content_size": 351,
    "content_size_unit": "bytes",
    "connection_established": true
  }
}
```

---

### 3.3 Create Service

`POST /api/services`

**Auth:** Bearer token

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| service_name | string | Yes | 1-100 characters |
| endpoint_url | string | Yes | Valid HTTP/HTTPS URL |
| method | string | No | Default: `GET`. Options: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| check_interval | int | Yes | 15000-3600000 (ms) |
| expected_status_codes | int[] | No | Default: `[200, 201, 204]`. Each 100-599 |
| failure_threshold | int | No | Default: `3`. Range: 1-10 |
| headers | object | No | Key-value pairs |
| body | string | No | For POST/PUT/PATCH methods |

```json
{
  "service_name": "API Gateway",
  "endpoint_url": "https://httpbin.org/status/200",
  "method": "GET",
  "check_interval": 60000,
  "expected_status_codes": [200],
  "failure_threshold": 3
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service_id": "srv_606c2cc7",
    "service_name": "Test API Doc",
    "endpoint_url": "https://httpbin.org/status/200",
    "method": "GET",
    "status": "active",
    "monitoring_started": true,
    "created_at": "2026-02-08T17:01:39.508Z"
  }
}
```

**Error — Validation (400):**

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Service name is required and must be under 100 characters",
  "fields": [
    {
      "type": "field",
      "value": "",
      "msg": "Service name is required and must be under 100 characters",
      "path": "service_name",
      "location": "body"
    },
    {
      "type": "field",
      "value": "not-a-url",
      "msg": "A valid HTTP/HTTPS URL is required",
      "path": "endpoint_url",
      "location": "body"
    },
    {
      "type": "field",
      "value": 5,
      "msg": "Check interval must be between 15000ms and 3600000ms",
      "path": "check_interval",
      "location": "body"
    }
  ]
}
```

---

### 3.4 Get Service Details

`GET /api/services/:service_id`

**Auth:** Bearer token (must own the service)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Service fetched successfully",
  "data": {
    "service": {
      "id": "srv_3f0d2fa2",
      "name": "Watchdog Self-Health",
      "endpoint": "http://localhost:3000/api/system/health",
      "method": "GET",
      "status": "active",
      "check_interval": 30000,
      "failure_threshold": 3,
      "created_at": "2026-02-08T16:52:53.900Z"
    },
    "quick_metrics": {
      "status": "active",
      "uptime_30d": 100,
      "avg_response": 9,
      "errors_7d": 0
    },
    "response_time_history": [
      {
        "time": "2026-02-08T16:53:23.923Z",
        "value": 8
      },
      {
        "time": "2026-02-08T16:53:53.934Z",
        "value": 11
      }
    ],
    "health_check_log": [
      {
        "id": "chk_af5bdd016833",
        "node_id": "srv_3f0d2fa2",
        "status_code": 200,
        "status_text": "OK",
        "response_time": 6,
        "success": true,
        "error_message": "",
        "created_at": "2026-02-08T17:01:23.407Z"
      }
    ],
    "errors": []
  }
}
```

**Notes:**
- `quick_metrics.uptime_30d` — uptime percentage over last 30 days
- `quick_metrics.avg_response` — average response time in ms (all time)
- `quick_metrics.errors_7d` — count of failed checks in last 7 days
- `response_time_history` — response times from last 24 hours (for charting)
- `health_check_log` — last 50 checks (newest first)
- `errors` — last 20 failed checks (newest first)

**Error — Not Found (404):**

```json
{
  "success": false,
  "error": "NODE_NOT_FOUND",
  "message": "Service not found"
}
```

---

### 3.5 Update Service

`PATCH /api/services/:service_id`

**Auth:** Bearer token (must own the service)

**Request Body (all fields optional):**

| Field | Type | Rules |
|-------|------|-------|
| service_name | string | 1-100 characters |
| endpoint_url | string | Valid HTTP/HTTPS URL |
| method | string | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| check_interval | int | 15000-3600000 (ms) |
| failure_threshold | int | 1-10 |
| headers | object | Key-value pairs |
| body | string | Request body content |
| expected_status_codes | int[] | Each 100-599 |

```json
{
  "service_name": "API Gateway Updated",
  "check_interval": 30000
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service_id": "srv_606c2cc7",
    "service_name": "Test API Doc Updated",
    "endpoint_url": "https://httpbin.org/status/200",
    "method": "GET",
    "check_interval": 30000,
    "failure_threshold": 3,
    "status": "active",
    "updated_at": "2026-02-08T17:01:39.550Z"
  }
}
```

---

### 3.6 Delete Service

`DELETE /api/services/:service_id`

**Auth:** Bearer token (must own the service)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": {
    "service_id": "srv_606c2cc7",
    "deleted_at": "2026-02-08T17:01:41.427Z"
  }
}
```

**Notes:**
- Stops monitoring immediately
- Deletes all associated health check history

---

### 3.7 Pause Monitoring

`POST /api/services/:service_id/pause`

**Auth:** Bearer token (must own the service)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Service monitoring paused",
  "data": {
    "service_id": "srv_606c2cc7",
    "status": "paused",
    "paused_at": "2026-02-08T17:01:39.575Z"
  }
}
```

**Error — Already Paused (400):**

```json
{
  "success": false,
  "error": "NODE_ALREADY_PAUSED",
  "message": "Service is already paused"
}
```

---

### 3.8 Resume Monitoring

`POST /api/services/:service_id/resume`

**Auth:** Bearer token (must own the service)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Service monitoring resumed",
  "data": {
    "service_id": "srv_606c2cc7",
    "status": "active",
    "resumed_at": "2026-02-08T17:01:39.598Z"
  }
}
```

**Error — Already Active (400):**

```json
{
  "success": false,
  "error": "NODE_ALREADY_ACTIVE",
  "message": "Service is already active"
}
```

**Notes:**
- Resets consecutive failures to 0
- Restarts the monitoring timer immediately

---

### 3.9 Manual Test Check

`POST /api/services/:service_id/test`

**Auth:** Bearer token (must own the service)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Test check completed",
  "data": {
    "status_code": 200,
    "status_text": "OK",
    "response_time": 1154,
    "response_time_unit": "ms",
    "content_size": 0,
    "content_size_unit": "bytes",
    "connection_established": true
  }
}
```

**Notes:**
- Does NOT save as a health check record
- Uses the service's configured endpoint, method, headers, and body

---

## 4. System

### 4.1 System Status

`GET /api/system/status`

**Auth:** None (public)

**Success Response (200):**

```json
{
  "success": true,
  "message": "System status fetched successfully",
  "data": {
    "system_status": "operational",
    "total_services": 2,
    "active_monitors": 2,
    "timestamp": "2026-02-08T17:00:59.075Z",
    "version": "v1.0.0-mvp"
  }
}
```

**Notes:**
- `system_status` is `"operational"` when no services are down, `"degraded"` otherwise

---

### 4.2 Health Check

`GET /api/system/health`

**Auth:** None (public)

**Success Response (200):**

```json
{
  "status": "ok",
  "uptime": 218.65
}
```

**Notes:**
- `uptime` is server uptime in seconds

---

## 5. Common Error Responses

### 401 — No Token

```json
{
  "success": false,
  "error": "TOKEN_REQUIRED",
  "message": "Authentication token is required"
}
```

### 401 — Invalid/Expired Token

```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

### 400 — Validation Error

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "<first validation error message>",
  "fields": [
    {
      "type": "field",
      "value": "<submitted value>",
      "msg": "<error message>",
      "path": "<field name>",
      "location": "body"
    }
  ]
}
```

### 404 — Not Found

```json
{
  "success": false,
  "error": "NODE_NOT_FOUND",
  "message": "Service not found"
}
```

---

## 6. Endpoint Summary

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/api/auth/register` | No | Register new user |
| 2 | POST | `/api/auth/login` | No | Login |
| 3 | GET | `/api/auth/me` | Yes | Get current user profile |
| 4 | GET | `/api/dashboard/overview` | Yes | Dashboard overview (cached 30s) |
| 5 | GET | `/api/services` | Yes | List services (paginated) |
| 6 | POST | `/api/services/test` | Yes | Test connection (pre-create) |
| 7 | POST | `/api/services` | Yes | Create service |
| 8 | GET | `/api/services/:service_id` | Yes | Get service details |
| 9 | PATCH | `/api/services/:service_id` | Yes | Update service |
| 10 | DELETE | `/api/services/:service_id` | Yes | Delete service |
| 11 | POST | `/api/services/:service_id/pause` | Yes | Pause monitoring |
| 12 | POST | `/api/services/:service_id/resume` | Yes | Resume monitoring |
| 13 | POST | `/api/services/:service_id/test` | Yes | Manual test check |
| 14 | GET | `/api/system/status` | No | System status |
| 15 | GET | `/api/system/health` | No | Health check |
