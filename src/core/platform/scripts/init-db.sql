-- AIBOS Core Platform Database Schema
-- PostgreSQL initialization script

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(512),
  organization_id UUID,
  role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(512),
  plan VARCHAR(50) DEFAULT 'starter', -- starter, growth, professional, enterprise
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan VARCHAR(50) NOT NULL, -- starter, growth, professional, enterprise
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active', -- active, canceled, past_due, unpaid
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- BILLING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  period DATE NOT NULL, -- YYYY-MM format
  usage_json JSONB, -- { api_calls: 1000, ai_minutes: 50 }
  base_charge DECIMAL(10, 2),
  usage_charges DECIMAL(10, 2),
  total DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, failed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_billing_organization_id ON billing(organization_id);
CREATE INDEX idx_billing_period ON billing(period);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(255) NOT NULL, -- create, update, delete, login, etc
  resource_type VARCHAR(255), -- user, organization, subscription, etc
  resource_id VARCHAR(255),
  changes JSONB, -- what changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- API KEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  resource VARCHAR(255) NOT NULL, -- leads, contacts, reports, etc
  action VARCHAR(50) NOT NULL, -- read, write, delete, admin
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id)
);

CREATE INDEX idx_permissions_user_id ON permissions(user_id);
CREATE INDEX idx_permissions_organization_id ON permissions(organization_id);

-- ============================================
-- AI MEMORY (Knowledge Base) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100), -- architecture, decisions, preferences
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(255) -- AI agent name
);

CREATE INDEX idx_ai_memory_key ON ai_memory(key);
CREATE INDEX idx_ai_memory_category ON ai_memory(category);

-- ============================================
-- DECISION LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  decision_title VARCHAR(255) NOT NULL,
  description TEXT,
  alternatives JSONB,
  chosen_option VARCHAR(255),
  reasoning TEXT,
  decided_by VARCHAR(255), -- AI agent or user name
  decided_at TIMESTAMP DEFAULT NOW(),
  outcome VARCHAR(255), -- pending, success, failure, partial
  outcome_date TIMESTAMP
);

CREATE INDEX idx_decision_logs_organization_id ON decision_logs(organization_id);
CREATE INDEX idx_decision_logs_decided_at ON decision_logs(decided_at);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Test user
INSERT INTO users (email, name, password_hash, role)
VALUES ('test@aibos.local', 'Test User', '$2a$10$test', 'admin')
ON CONFLICT DO NOTHING;

-- Test organization
INSERT INTO organizations (name, slug, created_by)
SELECT id, 'test-org', id
FROM users
WHERE email = 'test@aibos.local'
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);
