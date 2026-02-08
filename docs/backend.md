# BACKEND PRD - Monitor Central

**Version:** 1.0  
**Last Updated:** February 8, 2026  
**Status:** Pre-Development

---

## 1. SYSTEM OVERVIEW

### 1.1 Architecture Approach
The backend will be built as a distributed microservices architecture with the following core components:

- **API Service:** Handles all HTTP requests from frontend, mobile, and third-party integrations
- **Monitoring Engine:** Distributed worker system that executes health checks across multiple global regions
- **Alert Service:** Processes failure events and dispatches notifications through various channels
- **Scheduler Service:** Manages job queues and ensures checks run at correct intervals
- **Analytics Service:** Aggregates metrics, calculates uptime percentages, and generates reports

### 1.2 Technology Requirements
- **Language:** Strongly-typed language Node.js/TypeScript
- **Primary Database:** MongoDB
- **Cache Layer:** In-memory data store for high-frequency reads , node-cache or Redis
- **Time-Series Storage:** Optimized storage for check results and metrics

---

## 2. DATA MODEL REQUIREMENTS

### 2.1 Core Entities

**Users:**
- Unique identifier
- Authentication credentials (email, password hash, OAuth tokens)
- Account plan type (Free, Pro, Team)
- Profile information (name, company, role)
- Account creation and modification timestamps
- Billing information (subscription status, payment method)

**Services (Monitored Endpoints):**
- Unique identifier with user ownership
- Endpoint configuration (URL, HTTP method, headers, request body)
- Monitoring settings (check interval, timeout, expected status codes)
- Alerting thresholds (response time limit, failure threshold count)
- Status flags (active, paused, deleted)
- SSL verification settings
- Metadata (name, description, tags, creation date)

**Health Check Results:**
- Service reference
- Execution timestamp
- Check region (geographic location)
- HTTP response data (status code, response time, content size)
- Success/failure indicator
- Error details (if failed)
- SSL certificate information (expiry date, validity)
- Must support time-series queries (range queries, aggregations)

**Incidents (Downtime Events):**
- Service reference
- Incident timeline (start time, end time, duration)
- Failure count during incident
- Severity classification (critical, warning, info)
- Resolution method (auto-resolved, manual, escalated)
- Root cause notes (optional)

**Alert Channels:**
- User ownership
- Channel type (email, Slack, Discord, webhook, SMS)
- Configuration details (webhook URLs, email addresses, phone numbers)
- Authentication credentials (API keys, tokens)
- Enable/disable status
- Delivery verification settings

**Alert Rules:**
- Service and channel associations
- Trigger conditions (service down, slow response, recovery, SSL expiring)
- Threshold values (response time limits, failure counts)
- Enable/disable status
- Grouping settings (minimum time between alerts)

**Alert History:**
- Incident reference
- Alert channel used
- Delivery timestamp
- Delivery status (sent, failed, acknowledged)
- Failure reason (if delivery failed)
- User acknowledgment (timestamp, acknowledging user)

**Activity Logs:**
- User action tracking
- Service modification history
- Alert acknowledgments
- Configuration changes
- API access logs
- Audit trail for compliance

---

## 3. API SPECIFICATIONS

### 3.1 Authentication
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Get JWT token
POST   /api/auth/verify-email      - Verify email with code
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
POST   /api/auth/logout            - Invalidate token
GET    /api/auth/me                - Get current user
```

### 3.2 Services
```
GET    /api/services               - List user's services
POST   /api/services               - Create new service
GET    /api/services/:id           - Get service details
PATCH  /api/services/:id           - Update service config
DELETE /api/services/:id           - Delete service
POST   /api/services/:id/test      - Manual test check (doesn't count quota)
POST   /api/services/:id/pause     - Pause monitoring
POST   /api/services/:id/resume    - Resume monitoring
```

### 3.3 Health Checks & Metrics
```
GET    /api/services/:id/checks    - Get check history (paginated)
GET    /api/services/:id/metrics   - Get aggregated metrics (uptime, avg response time)
GET    /api/services/:id/incidents - Get incident timeline
GET    /api/dashboard/overview     - Get dashboard summary (all services)
```

### 3.4 Alerts
```
GET    /api/alert-channels         - List user's alert channels
POST   /api/alert-channels         - Add new channel (Slack, email, etc.)
PATCH  /api/alert-channels/:id     - Update channel config
DELETE /api/alert-channels/:id     - Remove channel
GET    /api/alert-rules            - List alert rules
POST   /api/alert-rules            - Create alert rule
PATCH  /api/alert-rules/:id        - Update rule
DELETE /api/alert-rules/:id        - Delete rule
GET    /api/alerts                 - Get recent alerts (unacknowledged)
POST   /api/alerts/:id/acknowledge - Mark alert as acknowledged
```

### 3.5 Analytics
```
GET    /api/analytics/stats        - Platform-wide stats (for stats bar)
GET    /api/analytics/usage        - User's quota usage
GET    /api/exports/checks         - Export check history (CSV/JSON)

### 3.1 Authentication Endpoints
**Registration and Login:**
- Create new user account with email verification
- Authenticate user and issue JWT access token
- Refresh expired tokens
- Password reset workflow (request token, validate, reset)
- OAuth integration (Google, GitHub)
- Email verification with time-limited codes
- Logout and token invalidation

**Security Requirements:**
- Passwords hashed with bcrypt (minimum 12 rounds)
- JWT tokens with 24-hour expiration
- Refresh tokens with 30-day expiration, stored securely
- Rate limiting: 5 failed login attempts → 15-minute lockout
- HTTPS only, no plain HTTP allowed

### 3.2 Service Management Endpoints
**CRUD Operations:**
- List all services for authenticated user (with pagination, sorting, filtering)
- Create new service with full configuration
- Retrieve single service details including recent metrics
- Update service configuration (endpoint, intervals, thresholds)
- Delete service and associated data
- Bulk operations (pause multiple, resume multiple, delete multiple)

**Service Actions:**
- Manual test check (immediate, doesn't count toward quota)
- Pause monitoring (stop checks, retain data)
- Resume monitoring (restart checks)
- Clone service configuration
- Export service configuration as JSON

**Filtering and Search:**
- Filter by status (operational, degraded, down, paused)
- Filter by tags or custom labels
- Search by name or URL
- Sort by name, uptime, response time, last check time

### 3.3 Monitoring Data Endpoints
**Health Check History:**
- Retrieve paginated check results for a service
- Filter by date range, region, status (success/failure)
- Limit response size (default 50 results, max 500)
- Include metadata (check region, response times, status codes)

**Metrics and Analytics:**
- Current service status (operational, degraded, down)
- Uptime percentage (24h, 7d, 30d, all-time)
- Average response time by time period
- Response time percentiles (p50, p95, p99)
- Check count by region
- Error rate over time
- SSL certificate expiry countdown

**Incident Management:**
- List incidents for service (with pagination)
- Retrieve incident details (duration, failure count, timeline)
- Mark incidents as resolved manually
- Add notes to incidents
- Export incident reports

**Dashboard Overview:**
- Aggregated stats across all services
- Service count by status
- Recent alerts (unacknowledged)
- Platform-wide uptime average
- Total checks performed today
- Active incidents count

### 3.4 Alert Management Endpoints
**Channel Management:**
- List configured alert channels
- Add new channel with validation (test delivery)
- Update channel configuration
- Delete channel (prevent if used in active rules)
- Test channel delivery (send test notification)

**Rule Configuration:**
- List all alert rules for user
- Create rule linking service, channel, and condition
- Update rule thresholds and settings
- Enable/disable rules
- Delete rules
- Preview which alerts would trigger based on current state

**Alert History:**
- List recent alerts (with filters: channel, service, date range, status)
- Retrieve alert details (delivery attempts, timestamps, recipients)
- Acknowledge alerts
- Retry failed alert delivery
- Export alert history

### 3.5 User and Account Endpoints
**Profile Management:**
- Get current user profile
- Update profile information (name, email, password)
- Upload avatar/profile picture
- Configure notification preferences
- Set timezone for reports

**Team Management (Team Plan):**
- Invite team members via email
- Accept/reject invitations
- List team members
- Update member roles (admin, member, viewer)
- Remove team members
- Transfer ownership

**Billing and Subscription:**
- Get current plan details and usage
- View quota usage (checks used, services count)
- Upgrade/downgrade plan
- Update payment method
- View invoices and payment history
- Cancel subscription

**API Keys:**
- Generate API keys for programmatic access
- List active API keys
- Revoke API keys
- Set key permissions and scopes

### 3.6 Public/Webhook Endpoints
**Status Page (Public):**
- Serve public status page data (if enabled)
- Current operational status
- Recent incident history
- Subscribe to status updates

**Webhook Receivers:**
- Receive incoming webhooks from alert channels (for two-way integration)
- OAuth callback handlers (Slack, Discord)
- Payment provider webhooks (Stripe, PayPal)

---

## 4. MONITORING ENGINE SPECIFICATIONS

### 4.1 Check Execution Requirements

**Scheduling:**
- Jobs scheduled based on service check_interval (15s, 30s, 1m, 5m, 15m, 30m, 1h)
- Distributed job queue prevents duplicate checks
- Jobs distributed evenly across available workers
- Failed jobs automatically retried with exponential backoff
- Maximum 3 retry attempts before marking as system failure

**Check Process:**
- Build HTTP/HTTPS request with configured method, headers, body
- Set connection timeout based on service configuration
- Execute request from designated region
- Measure total response time (DNS + connection + response)
- Capture HTTP status code, headers, body size
- Verify SSL certificate if enabled (expiry date, chain validity)
- Compare response against expected status codes
- Determine success/failure based on criteria

**Multi-Region Verification:**
- Primary check executes from designated region
- On failure, immediately trigger checks from 2 additional regions
- Regions selected based on geographic diversity
- Failure confirmed only if majority (2/3) of regions fail
- Reduces false positives from regional network issues
- Maximum 15-second window for multi-region verification

**Result Storage:**
- Save all check results with timestamp and region
- Include success/failure flag
- Store response time, status code, content size
- Log error messages for failures
- Compress old results (>90 days) to reduce storage
- Delete results older than retention period (plan-dependent)

### 4.2 Failure Detection Logic

**Consecutive Failure Tracking:**
- Track last N check results per service (configurable, default 10)
- Count consecutive failures
- Reset counter on any successful check
- Compare against service failure_threshold (default 3)

**Incident Creation:**
- Threshold reached + multi-region confirmation → Create incident
- Record incident start time, initial failure count
- Mark incident as "active" (unresolved)
- Link incident to service
- Set severity based on service criticality (configurable)

**Ongoing Monitoring:**
- Continue checks at normal interval during incidents
- Increment incident failure count for each continued failure
- Track longest consecutive downtime
- Capture detailed error logs for debugging

### 4.3 Recovery Detection

**Success After Failure:**
- First successful check after failure threshold → Potential recovery
- Execute 2 additional verification checks (within 2 minutes)
- If majority succeed → Confirm recovery
- Mark incident as resolved
- Calculate total downtime duration
- Record recovery as auto-resolved
- Trigger recovery notifications

**Partial Recovery Handling:**
- If only some regions succeed, continue monitoring
- Wait for consistent success across all regions
- Prevent flapping (rapid up/down state changes)
- Minimum 5 consecutive successes before declaring full recovery

---

## 5. ALERTING SYSTEM SPECIFICATIONS

### 5.1 Alert Triggering Rules

**Conditions:**
- **Service Down:** Failure threshold met + confirmed by multiple regions
- **Slow Response:** Response time exceeds threshold for N consecutive checks (default: 5)
- **Service Recovered:** First successful check after incident
- **SSL Expiring:** Certificate expires within N days (default: 30, 14, 7, 1)

**Alert Grouping (Anti-Spam):**
- Maximum 1 alert per service per channel per 5 minutes (configurable)
- Exception: Recovery alerts always sent immediately
- Group multiple failures into single alert with failure count
- Escalation: If downtime exceeds 1 hour, send reminder alert

**Delivery Priority:**
- Critical alerts (service down): Process immediately, parallel delivery
- Warning alerts (slow response): Queue for batch processing (30s delay)
- Info alerts (recovery, SSL warnings): Queue for batch processing
- Failed deliveries: Retry 3 times with exponential backoff (1s, 5s, 15s)

### 5.2 Notification Channels

**Email:**
- HTML formatted with service details, incident timeline, quick action links
- Plain text fallback for compatibility
- Include charts/graphs as embedded images
- Subject line: "[ALERT] Service Name - Status"
- From address: alerts@monitorcentral.com
- Maximum 1 email per 5 minutes per service (grouped)
- Delivery via SendGrid, AWS SES, or equivalent

**Slack:**
- Send via incoming webhook
- Rich formatting with blocks (service name, status, response time, link to dashboard)
- Include action buttons (Acknowledge, View Details)
- Thread follow-up messages (recovery notification as reply to original)
- Handle rate limits (1 message per second per webhook)
- Retry on 429 rate limit responses

**Discord:**
- Similar formatting to Slack (embeds with color coding)
- Red embed for failures, green for recovery, orange for warnings
- Include timestamp, incident duration, affected service
- Mention @role or @user if configured
- Respect Discord rate limits

**Webhooks (Custom):**
- POST JSON payload to configured URL
- Standard payload format with service, incident, and timestamp data
- Include HMAC signature for verification
- Timeout after 10 seconds
- Retry failed deliveries up to 3 times
- Log all webhook attempts for debugging

**SMS (Pro/Team Plans Only):**
- Send via Twilio or equivalent
- Short format: "ALERT: {service_name} is down. Check dashboard."
- Only for critical alerts (service down)
- Respect quiet hours if configured (default: no restriction)
- Maximum 3 SMS per day per service (prevents bill shock)

### 5.3 Alert History and Tracking

**Logging:**
- Record every alert attempt (success and failure)
- Store delivery timestamp, channel, status
- Log error messages for failed deliveries
- Track user acknowledgments (who, when)
- Calculate average delivery time

**Acknowledgment:**
- User can acknowledge alerts from dashboard or via callback links
- Acknowledgment stops reminder alerts for that incident
- Record acknowledging user and timestamp
- Optionally add notes to acknowledgment

**Reporting:**
- Alert volume by channel, service, time period
- Delivery success rate per channel
- Average time to acknowledgment
- Most frequently failing services
- Alert response time (detection to delivery)

---

## 6. DATA RETENTION AND CLEANUP

**Check Results:**
- Free plan: 30 days, then delete
- Pro plan: 1 year, then aggregate (hourly summaries)
- Team plan: 2 years, then aggregate
- Aggregated data retained indefinitely (daily uptime %, avg response time)

**Incidents:**
- Retain all incidents for duration of plan retention period
- Never delete incidents, only archive
- Archived incidents excluded from dashboard but accessible via API

**Alert History:**
- Retain 90 days of detailed logs
- Aggregate older alerts into monthly summaries
- Summaries retained for life of account

**Activity Logs:**
- Retain 1 year for all plans
- Compliance requirement for audit trail

**Automated Cleanup:**
- Daily job runs at 2 AM UTC
- Deletes expired check results
- Archives old incidents
- Compresses logs older than 90 days
- Sends deletion summary to monitoring team

---

## 7. PERFORMANCE REQUIREMENTS

### 7.1 API Performance
- **Response Time:**
  - 95th percentile: <200ms for all GET endpoints
  - 95th percentile: <500ms for all POST/PATCH/DELETE endpoints
  - Dashboard overview: <2 seconds total load time (including frontend)

- **Throughput:**
  - Handle 10,000 requests per second at peak
  - Auto-scale horizontally when CPU >70% for 5 minutes
  - Maximum concurrent connections: 50,000

- **Database:**
  - Query response time: <50ms for indexed queries
  - Connection pool: 100 connections per API instance
  - Read replicas for reporting queries (reduce load on primary)

### 7.2 Monitoring Engine Performance
- **Check Execution:**
  - Process 100,000 checks per minute across all workers
  - Queue lag: <10 seconds (time between scheduled and executed)
  - Regional distribution: Even load across all regions

- **Failure Detection:**
  - Detect downtime within 90 seconds (3 × 30s checks)
  - Multi-region verification: Complete within 15 seconds
  - Incident creation: <1 second after confirmation

- **Resource Usage:**
  - Worker memory: <512MB per instance
  - CPU: <50% average, <80% peak
  - Network: Handle 1 Gbps throughput per region

### 7.3 Alert Delivery Performance
- **Speed:**
  - Email: <5 seconds from detection to delivery
  - Slack/Discord: <3 seconds
  - Webhooks: <2 seconds
  - SMS: <10 seconds

- **Reliability:**
  - 99.9% delivery success rate
  - Failed deliveries retried within 30 seconds
  - Fallback channels if primary fails (email as backup)

- **Volume:**
  - Process 10,000 alerts per minute
  - Queue capacity: 100,000 pending alerts
  - Priority queue for critical alerts

---

## 8. SECURITY REQUIREMENTS

### 8.1 Authentication and Authorization
- **Password Security:**
  - Minimum 8 characters (enforced in frontend and backend)
  - Bcrypt hashing with cost factor 12+
  - Salted hashes (unique per user)
  - No password stored in plain text anywhere

- **JWT Tokens:**
  - Signed with RS256 (RSA asymmetric keys)
  - 24-hour expiration for access tokens
  - Refresh tokens stored in database with user reference
  - Tokens invalidated on password change or logout
  - Include user_id, plan, and permissions in payload

- **OAuth:**
  - Support Google and GitHub OAuth 2.0
  - Store OAuth tokens encrypted at rest
  - Refresh tokens before expiry
  - Handle token revocation gracefully

- **API Keys:**
  - Generate with cryptographically secure random bytes
  - Hash before storing (treat like passwords)
  - Prefix to identify key type (pk_live_, pk_test_)
  - Scoped permissions (read-only, write, admin)
  - Rate limit per API key (1,000 requests/hour)

### 8.2 Data Protection
- **Encryption at Rest:**
  - Database: AES-256 encryption for entire database
  - Sensitive fields: Additional encryption layer (API keys, OAuth tokens)
  - Backups: Encrypted before storage
  - Key management: AWS KMS or equivalent

- **Encryption in Transit:**
  - HTTPS only (TLS 1.2 minimum, prefer TLS 1.3)
  - HSTS headers (strict-transport-security)
  - Certificate pinning for internal services
  - Mutual TLS for service-to-service communication

- **Data Minimization:**
  - Don't store endpoint response bodies (only metadata)
  - Don't log sensitive headers (Authorization, Cookies)
  - Redact passwords and tokens in application logs
  - PII limited to email and name only

### 8.3 Rate Limiting and Abuse Prevention
- **API Rate Limits:**
  - Free plan: 100 requests/hour
  - Pro plan: 1,000 requests/hour
  - Team plan: 5,000 requests/hour
  - Sliding window algorithm (not fixed window)
  - Return 429 with Retry-After header

- **Authentication Rate Limits:**
  - Login attempts: 5 per 15 minutes per IP
  - Registration: 3 per hour per IP
  - Password reset: 3 per hour per email
  - Email verification: 5 per hour per email

- **DDoS Protection:**
  - Cloudflare or AWS Shield for network layer
  - Rate limiting at API gateway
  - IP-based blocking for repeat offenders
  - CAPTCHA on suspicious activity

### 8.4 Compliance and Auditing
- **GDPR Compliance:**
  - User data export endpoint (JSON format)
  - Account deletion with complete data removal
  - Consent tracking for marketing emails
  - Right to be forgotten implementation

- **SOC 2 Type II:**
  - Activity logging for all user actions
  - Access control reviews (quarterly)
  - Security incident response procedures
  - Regular security audits (annual penetration testing)

- **Audit Logs:**
  - Log all authentication events
  - Log data access (who accessed what, when)
  - Log configuration changes
  - Retain logs for 1 year minimum
  - Immutable logs (append-only)

---

## 9. SCALABILITY AND RELIABILITY

### 9.1 Horizontal Scaling
- **API Service:**
  - Stateless design (no session storage in memory)
  - Auto-scale based on CPU and request count
  - Minimum 2 instances (redundancy)
  - Maximum 50 instances (cost control)
  - Scale up at 70% CPU, scale down at 30% CPU

- **Monitoring Workers:**
  - Distribute checks via message queue
  - Each worker pulls jobs from queue (pull model)
  - Workers auto-scale based on queue depth
  - Target: Queue depth <10,000 jobs
  - Workers are ephemeral (can be terminated anytime)

- **Database:**
  - Primary-replica setup (1 primary, 2+ read replicas)
  - Vertical scaling for primary (up to 64 vCPU)
  - Read replicas for reporting and analytics queries
  - Connection pooling with PgBouncer
  - Automatic failover to replica if primary fails

### 9.2 High Availability
- **Multi-AZ Deployment:**
  - Deploy across 3 availability zones minimum
  - Database replicas in different AZs
  - Load balancer distributes across AZs
  - Health checks every 10 seconds
  - Automatic traffic rerouting on failure

- **Failure Recovery:**
  - Database: <60 seconds failover time (automatic)
  - API: <10 seconds (health check + reroute)
  - Monitoring workers: <5 seconds (new worker spawned)
  - Alert service: <30 seconds (queue persisted in Redis)

- **Backup Strategy:**
  - Database: Daily automated backups, retained 30 days
  - Point-in-time recovery (up to 7 days)
  - Cross-region backup replication (disaster recovery)
  - Backup restoration tested monthly

### 9.3 Monitoring and Observability
- **System Metrics:**
  - CPU, memory, disk, network per service
  - Request rate, error rate, latency (RED metrics)
  - Database query performance (slow query log)
  - Queue depth, processing rate, job failures
  - Alert delivery success rate

- **Application Logs:**
  - Structured logging (JSON format)
  - Log levels: ERROR, WARN, INFO, DEBUG
  - Centralized log aggregation (CloudWatch, Datadog, or ELK)
  - Log retention: 30 days
  - Searchable and filterable

- **Alerts for Operations Team:**
  - API error rate >1% for 5 minutes
  - Database connection pool >90% for 3 minutes
  - Queue depth >50,000 for 5 minutes
  - Disk usage >85%
  - Any service down for >2 minutes
  - Failed database backup

- **Distributed Tracing:**
  - Trace requests across services
  - Identify bottlenecks in multi-service calls
  - Measure end-to-end latency
  - Tools: Jaeger, AWS X-Ray, or Datadog APM

---

## 10. INTEGRATION REQUIREMENTS

### 10.1 Third-Party Services

**Email Delivery:**
- Provider: Resend
- Transactional emails (alerts, verification, password reset)
- Marketing emails (newsletter, feature announcements)
- Bounce and complaint handling
- Email template management

---

## 11. QUALITY ASSURANCE

### 11.1 Testing Requirements

**Unit Tests:**
- 80% code coverage minimum
- Test all business logic functions
- Mock external dependencies
- Fast execution (<5 seconds total)

**Integration Tests:**
- Test API endpoints end-to-end
- Test database operations with real database (test environment)
- Test message queue producers and consumers
- Test alert delivery (with test accounts)

**Load Tests:**
- Simulate 10,000 concurrent API requests
- Simulate 100,000 health checks per minute
- Measure response times under load
- Identify bottlenecks
- Run before each major release

**Security Tests:**
- SQL injection testing (automated with SQLMap)
- XSS testing (automated with OWASP ZAP)
- Authentication bypass attempts
- Rate limit bypass attempts
- Penetration testing (annual, external firm)

### 11.2 Deployment Process

**CI/CD Pipeline:**
- Run tests on every commit (GitHub Actions, GitLab CI, or CircleCI)
- Build Docker images on passing tests
- Push images to container registry
- Deploy to staging environment automatically
- Manual approval required for production

**Staging Environment:**
- Identical to production (infrastructure as code)
- Deploy every merged PR automatically
- Run smoke tests after deployment
- Test alert delivery with test accounts
- QA approval before production

**Production Deployment:**
- Blue-green deployment (zero downtime)
- Deploy to 10% of traffic first (canary)
- Monitor error rates and latency for 15 minutes
- If healthy, deploy to 100%
- If issues detected, automatic rollback

**Rollback Plan:**
- Database migrations reversible
- Feature flags for gradual rollout
- Previous Docker images retained (last 10 versions)
- Rollback completes in <5 minutes

---

## 12. SUCCESS CRITERIA

### 12.1 Technical Metrics

**Reliability:**
- Platform uptime: 99.9% (4.3 hours downtime/month max)
- False positive rate: <0.1% (99.9% check accuracy)
- Alert delivery success: 99.9%
- Database backup success: 100%

**Performance:**
- API p95 latency: <200ms
- Dashboard load time: <2s
- Check execution time: <5s (including multi-region verification)
- Alert delivery time: <5s

**Scalability:**
- Support 100,000 monitored services by Month 6
- Process 1 billion checks per day by Month 12
- Support 10,000 concurrent users

**Security:**
- Zero data breaches
- Zero successful brute force attacks
- Zero SQL injections
- Pass SOC 2 Type II audit within 12 months