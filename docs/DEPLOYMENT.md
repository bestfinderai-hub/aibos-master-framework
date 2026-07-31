# AIBOS Framework — Deployment Guide

**Production deployment and infrastructure setup for AIBOS Framework**

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] TypeScript strict: `npm run build`
- [ ] ESLint clean: `npm run lint`
- [ ] No console.log statements in production code
- [ ] Environment variables documented in .env.example
- [ ] All secrets in environment (not code)

### Security
- [ ] Security audit completed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database backups automated
- [ ] Secrets rotation policy in place

### Performance
- [ ] Database queries optimized (EXPLAIN ANALYZE)
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Load testing passed (10x expected traffic)
- [ ] Monitoring and alerts configured

### Operations
- [ ] Runbook documented
- [ ] Incident response plan ready
- [ ] On-call rotation established
- [ ] Rollback procedure tested
- [ ] Log aggregation configured

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend + API)

**Pros**: Auto-scaling, zero-config deploys, edge functions, free tier  
**Cons**: Limited backend processing (15-min timeout), serverless constraints

#### Steps:

1. **Connect Repository**
```bash
npm install -g vercel
vercel login
vercel link
```

2. **Configure Environment**
```bash
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add JWT_SECRET
vercel env add ANTHROPIC_API_KEY
# ... add all secrets
```

3. **Deploy**
```bash
vercel --prod
```

4. **Verify**
```bash
curl https://your-app.vercel.app/health
```

### Option 2: Railway (Recommended for Full Stack)

**Pros**: Easy Node.js + PostgreSQL + Redis, simple deployment, good for startups  
**Cons**: Less customization than AWS

#### Steps:

1. **Create Railway Project**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your repository

2. **Add Services**
   - Add PostgreSQL (database)
   - Add Redis (cache)
   - Configure environment variables

3. **Configure App**
```railway.json
{
  "builder": "nixpacks",
  "start": "npm run start"
}
```

4. **Deploy**
   - Push to main branch
   - Railway auto-deploys

### Option 3: AWS (EC2 + RDS + ElastiCache)

**Pros**: Maximum control, unlimited scale, enterprise features  
**Cons**: More complex, higher cost

#### Steps:

1. **Create EC2 Instance**
```bash
# Launch Ubuntu 20.04 LTS t3.medium (or larger)
# Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

2. **Setup Server**
```bash
ssh -i key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

3. **Deploy App**
```bash
git clone <repo> aibos
cd aibos
npm install --production
pm2 start npm --name "aibos" -- start
pm2 startup
pm2 save
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable HTTPS**
```bash
sudo certbot --nginx -d your-domain.com
```

6. **Start Nginx**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🗄️ Database Setup

### PostgreSQL

#### Local Development
```bash
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=aibos \
  -e POSTGRES_DB=aibos \
  postgres:13

# Set DATABASE_URL
export DATABASE_URL=postgresql://aibos:password@localhost:5432/aibos
```

#### Production (AWS RDS)
```bash
# Create RDS instance via AWS Console
# Set PROD DATABASE_URL:
DATABASE_URL=postgresql://admin:securepass@aibos-db.xxx.us-east-1.rds.amazonaws.com:5432/aibos
```

#### Migrations
```bash
# Run migrations
npm run migrate

# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Redis

#### Local Development
```bash
docker run -d \
  -p 6379:6379 \
  redis:6-alpine

export REDIS_URL=redis://localhost:6379
```

#### Production (AWS ElastiCache)
```bash
# Create ElastiCache Redis cluster via AWS Console
# Set PROD REDIS_URL:
REDIS_URL=redis://aibos-cache.xxx.ng.0001.use1.cache.amazonaws.com:6379
```

---

## 🔒 Security Configuration

### Environment Variables (Never commit!)

```bash
# .env.production
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=generate-with: openssl rand -base64 32
JWT_EXPIRY=24h

# AI/LLM
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Payment
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=https://...
DATADOG_API_KEY=...
```

### SSL/TLS

```bash
# Generate self-signed cert (testing only)
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Use Let's Encrypt (production)
certbot certonly --standalone -d your-domain.com
```

### Rate Limiting

```typescript
// Set in environment
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_REQUESTS_AUTH=1000
```

### CORS Configuration

```typescript
// src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-domain.com',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## 📊 Monitoring & Alerts

### Metrics to Monitor

```javascript
// Memory usage (alert if > 80%)
process.memoryUsage().heapUsed / process.memoryUsage().heapTotal > 0.8

// Response latency (alert if p99 > 1s)
histogram.percentile(99) > 1000

// Error rate (alert if > 5%)
errors / requests > 0.05

// Database connections (alert if > 80% of pool)
activeConnections / poolSize > 0.8
```

### Sentry (Error Tracking)

```bash
npm install @sentry/node @sentry/tracing

# Set SENTRY_DSN in environment
SENTRY_DSN=https://key@sentry.io/project-id
```

### DataDog (Full-Stack Monitoring)

```bash
npm install @datadog/browser-rum @datadog/browser-logs

# Set DATADOG_API_KEY in environment
DATADOG_API_KEY=your_key_here
```

### CloudWatch (AWS)

```bash
npm install aws-sdk

// Logs automatically sent to CloudWatch
```

---

## 🚨 Incident Response

### Alert Severities

| Level | Example | Action |
|-------|---------|--------|
| **CRITICAL** | Database down | Page on-call, begin incident response |
| **HIGH** | Error rate > 10% | Alert team, start investigation |
| **MEDIUM** | Latency p99 > 2s | Monitor, investigate if trend |
| **LOW** | Cache miss spike | Log for analysis |

### Runbook Template

```markdown
## Incident: [Service] Down

### Detection
- Alert: [Alert name] at [Time]
- Affected users: [Count/percentage]

### Immediate Actions (0-5 min)
1. [ ] Page on-call engineer
2. [ ] Create incident in tracking system
3. [ ] Check status dashboard
4. [ ] Review recent deploys

### Investigation (5-30 min)
1. [ ] Check error logs
2. [ ] Review metrics (CPU, memory, database)
3. [ ] Check external service status
4. [ ] Review recent code changes

### Resolution
1. [ ] Identify root cause
2. [ ] Implement fix or rollback
3. [ ] Verify resolution
4. [ ] Update status page

### Post-Mortem (24 hours)
1. [ ] Document what happened
2. [ ] Why it happened
3. [ ] How we'll prevent it
4. [ ] Action items assigned
```

---

## 🔄 Backup & Disaster Recovery

### Database Backup

```bash
# Automated daily backups
0 2 * * * pg_dump $DATABASE_URL | gzip > backups/db-$(date +\%Y\%m\%d).sql.gz

# Verify backup
pg_restore -d test_db backups/db-20260731.sql.gz

# Retention policy: Keep 30 days
find backups/ -name "db-*.sql.gz" -mtime +30 -delete
```

### File Backups

```bash
# S3 backup (for uploads, config files)
aws s3 sync ./uploads s3://aibos-backups/uploads --delete
aws s3 sync ./config s3://aibos-backups/config --delete
```

### Disaster Recovery Plan

```markdown
## RTO: 4 hours (Recovery Time Objective)
## RPO: 1 hour (Recovery Point Objective)

### If infrastructure fails:
1. Spin up new EC2 instance (5 min)
2. Restore database from backup (15 min)
3. Restore config & uploads from S3 (5 min)
4. Update DNS to point to new server (5 min)
5. Verify services up (10 min)
6. Total: ~40 minutes

### Testing
- Perform DR drill monthly
- Document results
- Update playbooks based on learnings
```

---

## 🚀 Scaling

### Vertical Scaling (Bigger Server)
- Upgrade EC2 instance type (t3.medium → t3.large)
- Increase database instance size
- Increase cache size

### Horizontal Scaling (More Servers)
```bash
# 1. Add load balancer (AWS ALB)
# 2. Launch 2-3 EC2 instances
# 3. Configure auto-scaling group
# 4. Point DNS to load balancer
```

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_calls_date ON calls(created_at DESC);

-- Vacuum to optimize storage
VACUUM ANALYZE;
```

---

## 📝 Deployment Commands

```bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Start (development)
npm run dev

# Start (production)
npm run start

# Deploy to Vercel
vercel --prod

# Deploy to Railway
git push origin main

# Deploy to AWS
git push aws main
```

---

## ✅ Post-Deployment Checklist

- [ ] All services healthy (status dashboard)
- [ ] Monitoring & alerts working
- [ ] Backups running
- [ ] SSL certificate valid
- [ ] DNS resolved correctly
- [ ] API responding < 500ms (p99)
- [ ] Error rate < 1%
- [ ] Database connections healthy
- [ ] Cache hit rate > 50%
- [ ] Logs aggregating correctly

---

## 🆘 Troubleshooting

### "Service won't start"
```bash
# Check logs
journalctl -u aibos -n 50

# Check port
sudo lsof -i :5000

# Check process
pm2 logs aibos
```

### "Database connection failed"
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### "Memory leak"
```bash
# Monitor memory
node --inspect=:9229 index.js

# Use Chrome DevTools: chrome://inspect
```

### "High latency"
```bash
# Check slow queries
SELECT mean_time, query FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

# Add indexes if needed
```

---

## 📞 Support

**Deployment issues?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Questions?** Open an issue on [GitHub](https://github.com/bestfinderai-hub/aibos-master-framework/issues)

---

**Last updated**: 2026-07-31  
**Version**: 1.0
