# DEL 2 — Core Platform (Den Stabila Basen)

## 🏗️ Arkitektur-Översikt

Core Platform är den stabila bas som ALLA projekt använder. Det innehåller endast funktioner som alla framtida projekt behöver.

```
┌─────────────────────────────────────────────┐
│       Frontend (Web, Mobile, API)           │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         API Gateway & Rate Limiting         │
│         (Auth, Logging, Monitoring)         │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼────────┐ ┌─────▼──────────┐
│  Core Services │ │ Event Bus &    │
│  - Auth        │ │ Message Queue  │
│  - Billing     │ │ (Async jobs)   │
│  - Users       │ └────────────────┘
│  - Orgs        │
│  - Permissions │
│  - Notifications
└───────┬────────┘
        │
┌───────▼──────────────────────────┐
│      Data Layer                   │
│ ┌──────────────────────────────┐ │
│ │  PostgreSQL (Transactional)  │ │
│ │  Redis (Cache & Sessions)    │ │
│ │  S3 (File Storage)           │ │
│ └──────────────────────────────┘ │
└────────────────────────────────────┘
```

## 🔑 Kärnkomponenter

### 1. Authentication & Authorization

**Teknik Stack**:
- JWT (JSON Web Tokens) för stateless auth
- OAuth 2.0 för third-party integrations
- MFA (Multi-Factor Authentication)
- RBAC (Role-Based Access Control)

**Funktioner**:
- User registration & login
- Password reset & recovery
- SSO (Single Sign-On) för enterprise
- Social login (Google, GitHub)
- API key management
- Session management

**Implementation**:
```javascript
// Example: Auth middleware
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});
```

### 2. Organizations & Users

**Data Model**:
```sql
Organizations
├── id (UUID)
├── name
├── slug (URL-friendly)
├── plan (tier: starter, growth, pro, enterprise)
├── created_at
└── settings (JSON)

Users
├── id (UUID)
├── email (unique)
├── password_hash (bcrypt)
├── name
├── avatar
├── organization_id (FK)
├── role (admin, member, viewer)
└── last_login

Permissions
├── user_id (FK)
├── resource (string: "leads", "contacts", etc)
├── action (string: "read", "write", "delete")
└── granted_at
```

**Functionality**:
- Invite users to organization
- Assign roles (admin, member, viewer)
- Fine-grained permissions (per resource)
- Audit log of permission changes

### 3. Billing & Subscription

**Integrations**:
- Stripe for payments
- Recurring subscriptions
- Usage-based billing
- Invoice generation

**Data Model**:
```sql
Subscriptions
├── organization_id (FK)
├── plan (starter, growth, pro, enterprise)
├── status (active, canceled, past_due)
├── current_period_start
├── current_period_end
└── auto_renew

Billing
├── organization_id (FK)
├── period (YYYY-MM)
├── usage (JSON: { api_calls: 1000, ai_minutes: 50 })
├── base_charge
├── usage_charges
├── total
└── status (draft, sent, paid, failed)
```

**Functionality**:
- Create/update/cancel subscriptions
- Track usage in real-time
- Generate invoices automatically
- Handle failed payments with retry logic
- Pro-rating for mid-month upgrades/downgrades

### 4. API Gateway

**Features**:
- Request routing
- Rate limiting (per user, per API key)
- Logging & monitoring
- Response caching
- Request validation

**Implementation**:
```javascript
// Rate limiting: 1000 requests/hour per user
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Too many requests, please try again later',
});

app.use('/api/', limiter);
```

### 5. Event Bus & Message Queue

**Purpose**: Async job processing (don't block API responses).

**Implementation**: RabbitMQ or AWS SQS

**Example Events**:
- user.created
- subscription.upgraded
- lead.imported
- report.generated
- email.sent

**Pattern**:
```javascript
// Publish event
await eventBus.publish('user.created', {
  userId: user.id,
  email: user.email,
});

// Subscribe to event
eventBus.subscribe('user.created', async (data) => {
  // Send welcome email
  // Create default workspace
  // Log to analytics
});
```

### 6. Notifications

**Channels**:
- In-app notifications (database)
- Email (SMTP)
- SMS (Twilio)
- Webhooks (for external systems)
- Slack integration

**Implementation**:
```javascript
await notificationService.send({
  userId: user.id,
  type: 'subscription_expiring_soon',
  channels: ['email', 'in_app'],
  template: 'subscription_expiring_7days',
  data: { organization_name: org.name },
});
```

### 7. Dashboard Framework

**Core Features**:
- Customizable widgets
- Drag-and-drop layout
- Save/load layouts
- Export to PDF/CSV
- Real-time data updates

**Widget Types**:
- KPI cards (metric + trend)
- Line charts (time series)
- Bar charts (comparison)
- Tables (sortable, filterable)
- Heatmaps
- Funnels

### 8. AI Memory & Knowledge Base

**Purpose**: Store system knowledge for AI agents.

**Structure**:
```sql
KnowledgeBase
├── key (string, unique)
├── value (JSON)
├── category (string: "architecture", "decisions", "preferences")
├── updated_at
└── updated_by (AI agent name)

Decision Log
├── decision_id (UUID)
├── what (string: what was decided)
├── why (string: reasoning)
├── alternatives (JSON: other options considered)
├── decided_by (string: AI agent or human)
├── decided_at
└── outcome (string: how did it turn out)
```

**Usage**:
- AI agents query knowledge base before making decisions
- Store recurring patterns (e.g., "for SMB customers, prioritize simplicity")
- Document past decisions to avoid re-deciding

## 📡 API Specification

### Base URL
```
https://api.aibos.local/v1
```

### Authentication
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-07-29T12:00:00Z"
}
```

### Common Endpoints

#### Users
```
POST   /auth/register          Create account
POST   /auth/login             Login
POST   /auth/logout            Logout
POST   /auth/refresh           Refresh token
GET    /users/me               Get current user
PATCH  /users/me               Update profile
```

#### Organizations
```
GET    /organizations          List my orgs
POST   /organizations          Create org
GET    /organizations/:id      Get org details
PATCH  /organizations/:id      Update org
POST   /organizations/:id/invite   Invite user
```

#### Billing
```
GET    /billing/subscription       Get current plan
PATCH  /billing/subscription       Change plan
GET    /billing/invoices           List invoices
GET    /billing/usage              Get usage stats
```

#### AI Memory
```
POST   /kb/decisions           Log a decision
GET    /kb/architecture        Get architecture docs
GET    /kb/preferences/:key    Get stored preference
```

## 🔐 Security

- All endpoints require authentication (except /auth/*)
- HTTPS/TLS 1.3 on all traffic
- Passwords hashed with bcrypt (10+ salt rounds)
- API keys rotated every 90 days
- CORS configured per environment
- Rate limiting on all endpoints
- Request logging + audit trails

## 📊 Database Schema

### Core Tables
```sql
organizations (id, name, slug, plan, created_at)
users (id, email, password_hash, organization_id, role)
subscriptions (id, organization_id, plan, status, current_period_end)
audit_logs (id, user_id, action, resource, changes, timestamp)
```

## 🚀 Deployment

### Local Development
```bash
docker-compose up
npm run dev
```

### Production
```bash
# Use Vercel (recommended)
vercel deploy --prod

# Or self-hosted with Docker
docker build -t aibos-core .
docker run -d aibos-core
```

## 📈 Monitoring

**Metrics to Track**:
- API latency (p50, p95, p99)
- Error rate (5xx, 4xx)
- Authentication failures
- Rate limit hits
- Database query performance
- Queue depth (async jobs)

**Tools**:
- Datadog/New Relic for APM
- Sentry for error tracking
- CloudWatch for logs

## 🔄 Migration Path

**If you're building a new AIBOS product**:

1. **Clone this repo** as starting point
2. **Fork the Core Platform** (no changes needed)
3. **Add your Extension** (new DEL module)
4. **Deploy** (it inherits all Core features)

Example:
```bash
git clone https://github.com/bestfinderai-hub/aibos-master-framework.git
cd aibos-master-framework
mkdir -p src/modules/my-custom-module
# Start coding your feature!
```

## 📝 Next Steps

1. Review DEL 3 for AI Organisation
2. Set up local development environment
3. Deploy Core Platform to staging
4. Create first Extension module

---

**Version**: 2.0  
**Status**: Stable  
**Last Updated**: 2026-07-29
