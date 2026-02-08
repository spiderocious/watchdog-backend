# API SPECIFICATION FOR MVP WATCHDOG

---

## 1. AUTHENTICATION APIs

### 1.1 User Registration (Signup)

**Endpoint:** `POST /api/auth/register`

**Request Payload:**
```json
{
  "full_name": "John Doe",
  "email": "operator@system.local",
  "password": "SecurePass123!",
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "user_id": "usr_7x9k2m4p",
      "email": "user@monitor.central",
      "full_name": "John Doe",
      "plan": "free"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_9x2k4m7p3n8q",
    "expires_in": 86400
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "fields": {
    "email": ["This email is already registered"]
  }
}
```

---

### 1.3 User Login

**Endpoint:** `POST /api/auth/login`

**Request Payload:**
```json
{
  "email": "user@monitor.central",
  "password": "********",
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "usr_7x9k2m4p",
      "email": "user@monitor.central",
      "full_name": "John Doe",
      "plan": "free"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_9x2k4m7p3n8q",
    "expires_in": 86400
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

### 1.4 Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_7x9k2m4p",
    "email": "user@monitor.central",
    "full_name": "John Doe",
    "plan": "free",
    "created_at": "2025-01-15T08:42:13Z"
  }
}
```

---

## 2. DASHBOARD APIs

### 2.1 Get Dashboard Overview

**Endpoint:** `GET /api/dashboard/overview`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "services_overview": [ // only 6 services returned for dashboard preview
      {
        "id": "srv_001",
        "status": "active",
        "name": "Auth-API-v2",
        "endpoint": "https://api.internal/auth",
        "method": "POST",
        "interval": 30000,
        "uptime_percentage": 99,
        "uptime_bar_width": 99,
        "avg_response": 12000,
        "last_check": "2s ago",
        "failure_count": 0,
        "success_count": 100,
        "avg_failure_rate": "0%",
        "avg_success_rate": "100%",
      }
    ],
    "real_time_telemetry": {
      "response_time": {
        "current": 2871.6,
        "unit": "ms",
        "threshold": 3000,
        "chart_data": [
          { "timestamp": "16:28:19", "value": 2650 },
          { "timestamp": "16:28:24", "value": 2800 },
          { "timestamp": "16:28:29", "value": 2950 },
          { "timestamp": "16:28:34", "value": 2750 },
          { "timestamp": "16:28:39", "value": 2871.6 }
        ]
      },
      "request_rate": {
        "current": 546.4,
        "unit": "QPM",
        "threshold": 600,
        "chart_data": [
          { "timestamp": "16:28:19", "value": 520 },
          { "timestamp": "16:28:24", "value": 540 },
          { "timestamp": "16:28:29", "value": 555 },
          { "timestamp": "16:28:34", "value": 530 },
          { "timestamp": "16:28:39", "value": 546.4 }
        ]
      },
      "error_rate": {
        "current": 0.5,
        "unit": "%",
        "threshold": 1.0,
        "chart_data": [
          { "timestamp": "16:28:19", "value": 0.4 },
          { "timestamp": "16:28:24", "value": 0.5 },
          { "timestamp": "16:28:29", "value": 0.6 },
          { "timestamp": "16:28:34", "value": 0.5 },
          { "timestamp": "16:28:39", "value": 0.5 }
        ]
      },
      "latency_p99": {
        "current": 89.7,
        "unit": "ms",
        "threshold": 80,
        "chart_data": [
          { "timestamp": "16:28:19", "value": 85 },
          { "timestamp": "16:28:24", "value": 88 },
          { "timestamp": "16:28:29", "value": 92 },
          { "timestamp": "16:28:34", "value": 87 },
          { "timestamp": "16:28:39", "value": 89.7 }
        ]
      }
    },
    "service_diagnostics": {
      "out_of_tolerance_count": 1,
      "check_logs": [
        {
          "id": "SRV-001",
          "service": "Auth-V2",
          "response_time": 242,
          "latency": 0.98,
          "status": 200,
          "timestamp": "2023-10-27T16:28:19Z",
          "status_text": "OK",
          "request": {
            "headers": "...",
            "body": "..."
          },
          "response": {
            "headers": "...",
            "body": "..."
          }
        },
      ]
    },
      "error_logs": [
        {
          "id": "SRV-001",
          "service": "Auth-V2",
          "response_time": 242,
          "latency": 0.98,
          "status": 400,
          "timestamp": "2023-10-27T16:28:19Z",
          "status_text": "Bad Request",
          "status": "info" | "warning" | "critical", 
          /* info if first failure, warning if 2nd consecutive failure, critical if 3rd+ consecutive failure */
          "request": {
            "headers": "...",
            "body": "..."
          },
          "response": {
            "headers": "...",
            "body": "..."
          }
        }
      ],
    "status_overview": {
      "uptime_percentage": 99.992,
      "instances": {
        "online": 24,
        "offline": 2
      },
      "monitoring_active": true,
      "active_monitors": 142,
      "inactive_monitors": 3
    },
    "metadata": {
      "timestamp": "2025-12-29 16:28:49 UTC",
      "system_status": "operational",
    }
  }
}
```

---

## 3. SERVICES APIs

### 3.1 Get All Services (Services List)

**Endpoint:** `GET /api/services`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
```
?page=1
&limit=5
&search=auth
&status=active|down|warning|paused
&sort_by=name|uptime|last_check
&sort_order=asc|desc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "uptime_avg": 99.7,
      "uptime_change": "+0.2%",
      "total_services": 142,
      "total_stable": true,
      "critical_count": 1,
      "critical_status": "pulsing",
      "latency_avg": 42,
      "latency_unit": "ms",
      "latency_change": "-2%",
      "alerts_status": "normal_range"
    },
    "services": [
      {
        "id": "srv_001",
        "status": "active",
        "name": "Auth-API-v2",
        "endpoint": "https://api.internal/auth",
        "method": "POST",
        "interval": "30S",
        "uptime_percentage": 99,
        "uptime_bar_width": 99,
        "avg_response": "12ms",
        "avg_response_color": "green",
        "last_check": "2s ago",
        "failure_count": 0,
        "success_count": 100,
        "avg_failure_rate": "0%",
        "avg_success_rate": "100%",
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 29,
      "total_items": 142,
      "items_per_page": 5,
      "showing_from": 1,
      "showing_to": 5
    }
  }
}
```

---


### 3.1.0 TEST ENDPOINT

**Request Payload Test Endpoint:**
```json
{
  "service_name": "API Gateway",
  "endpoint_url": "https://api.industrial-control.io/v1/metrics",
  "method": "GET",
  "headers": ".... anything ... (optional)",
  "body": ".... anything ... (optional, for POST/PUT/PATCH requests)"
}
```

**Success Response - Test Connection (200 OK):**
```json
{
  "success": true,
  "message": "Connection test successful",
  "test_result": {
    "status_code": 200,
    "status_text": "OK",
    "response_time": 42,
    "response_time_unit": "ms",
    "connection_established": true
  },
  "preview_response": {
    "status": "active",
    "load": 0.12,
    "units": "SI",
    "msg": "Handshake successful"
  }
}
```


### 3.2 Create New Service

**Endpoint:** `POST /api/services`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Payload (Complete - All Steps):**
```json
{
  "service_name": "API Gateway",
  "endpoint_url": "https://api.industrial-control.io/v1/metrics",
  "method": "GET",
  "headers": ".... anything ... (optional)",
  "body": ".... anything ... (optional, for POST/PUT/PATCH requests)",
  "check_interval": 30000,
  "request_timeout": 10000,
  "failure_threshold": 3,
  "expected_status_codes": [200, 201, 204],
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service_id": "srv_150",
    "service_name": "API Gateway",
    "endpoint_url": "https://api.industrial-control.io/v1/metrics",
    "status": "active",
    "monitoring_started": true,
    "first_check_scheduled": "2023-10-27T14:42:05Z",
    "created_at": "2023-10-27T14:42:01Z"
  }
}
```

---

### 3.3 Update Service

**Endpoint:** `PATCH /api/services/:service_id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Payload (Partial Update Allowed):**
```json
{
  "service_name": "API Gateway Updated",
  "check_interval": 60000,
  "failure_threshold": 5,
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service_id": "srv_150",
    "service_name": "API Gateway Updated",
    "check_interval": 60000,
    "failure_threshold": 5,
    "updated_at": "2023-10-27T15:30:00Z"
  }
}
```

---

### 3.4 Get Service Details

**Endpoint:** `GET /api/services/:service_id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "srv_001",
      "name": "API GATEWAY",
      "endpoint": "https://api.internal.services:8080/v1",
      "status": "operational",
      "status_change": "+0.08%",
      "created_at": "2024-01-15T08:00:00Z"
    },
    "quick_metrics": [
      {
        "label": "CURRENT STATUS",
        "value": "OPERATIONAL",
        "status": "operational",
        "subtext": "Last 24 hours: 100% uptime",
        "icon": "check_circle"
      },
      {
        "label": "UPTIME (30D)",
        "value": "99.98%",
        "trend": "↑ +0.12%",
        "subtext": "Industry avg: 99.9%",
        "icon": "schedule"
      },
      {
        "label": "AVG RESPONSE",
        "value": "124ms",
        "chart_type": "sparkline",
        "chart_data": [120, 125, 118, 130, 124, 122, 128],
        "subtext": "Target: <200ms",
        "icon": "flash_on"
      },
      {
        "label": "Errors (7D)",
        "value": "0",
        "trend": "↓ -3 from last week",
        "subtext": "Last Error: 8d ago",
        "icon": "warning"
      }
    ],
    "response_time_history": {
      "time_ranges": ["1H", "6H", "12H", "24H"],
      "selected_range": "1H",
      "current_value": "124ms",
      "threshold_line": 200,
      "threshold_exceeded_at": "14:05",
      "chart_data": [
        { "time": "13:02", "value": 115 },
        { "time": "13:30", "value": 120 },
        { "time": "14:00", "value": 135 },
        { "time": "14:05", "value": 210 },
        { "time": "14:15", "value": 145 },
        { "time": "14:30", "value": 130 },
        { "time": "14:42", "value": 124 }
      ]
    },
    "health_check_log": {
      "results": [
        {
          "id": "SRV-001",
          "service": "Auth-V2",
          "response_time": 242,
          "latency": 0.98,
          "status": 200,
          "timestamp": "2023-10-27T16:28:19Z",
          "status_text": "OK",
          "request": {
            "headers": "...",
            "body": "..."
          },
          "response": {
            "headers": "...",
            "body": "..."
          }
        },
      ],
      "download_options": ["CSV"]
    },
      "errors": [
        {
          "id": "SRV-001",
          "service": "Auth-V2",
          "response_time": 242,
          "latency": 0.98,
          "status": 400,
          "timestamp": "2023-10-27T16:28:19Z",
          "status_text": "Bad Request",
          "status": "info" | "warning" | "critical", 
          /* info if first failure, warning if 2nd consecutive failure, critical if 3rd+ consecutive failure */
          "request": {
            "headers": "...",
            "body": "..."
          },
          "response": {
            "headers": "...",
            "body": "..."
          }
        }
      ]
    "footer_status": {
      "connected": true,
      "latency": "12ms",
    },
  }
}
```

---

### 3.5 Pause Service Monitoring

**Endpoint:** `POST /api/services/:service_id/pause`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Service monitoring paused",
  "data": {
    "service_id": "srv_001",
    "status": "paused",
    "paused_at": "2023-10-27T15:45:00Z"
  }
}
```

---

### 3.6 Resume Service Monitoring

**Endpoint:** `POST /api/services/:service_id/resume`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Service monitoring resumed",
  "data": {
    "service_id": "srv_001",
    "status": "active",
    "resumed_at": "2023-10-27T15:50:00Z",
    "next_check": "2023-10-27T15:50:30Z"
  }
}
```

---

### 3.7 Delete Service

**Endpoint:** `DELETE /api/services/:service_id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": {
    "service_id": "srv_001",
    "deleted_at": "2023-10-27T16:00:00Z"
  }
}
```

---

### 3.8 Manual Test Check

**Endpoint:** `POST /api/services/:service_id/test`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Test check completed",
  "data": {
    "status_code": 200,
    "status_text": "OK",
    "response_time": 124,
    "response_time_unit": "ms",
    "content_size": 2400,
    "content_size_unit": "bytes",
    "ssl_valid": true,
    "ssl_expiry": "2025-06-15",
    "timestamp": "2023-10-27T14:42:01Z"
  }
}
```

---

## 5. SYSTEM STATUS APIs

### 5.1 Get System Status

**Endpoint:** `GET /api/system/status`

**No authentication required (public endpoint)**

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "system_status": "operational",
    "services_status": 142,
    "alerts_count": 3,
    "latency": "42ms",
    "timestamp": "2023-10-27T14:42:01.004Z",
    "version": "v4.2-STABLE"
  }
}
```

---

## GENERAL ERROR RESPONSES

**400 Bad Request:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "fields": {
    "endpoint_url": ["URL must be a valid HTTPS endpoint"]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Service not found"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

**END OF API SPECIFICATION**