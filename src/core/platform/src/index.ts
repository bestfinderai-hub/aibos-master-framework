/**
 * AIBOS Core Platform
 * Stable base for all AIBOS projects
 *
 * Includes: Auth, Billing, Users, Organizations, Permissions, API Gateway, Events
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: false,
    },
  },
});

// Initialize app
const app: Express = express();
const port = process.env.PORT || 3000;

// Initialize database
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize Redis
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// POST /auth/register
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // TODO: Implement registration
    // 1. Validate input
    // 2. Hash password
    // 3. Create user in DB
    // 4. Send verification email
    // 5. Return JWT token

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: 'user_123',
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // TODO: Implement login
    // 1. Validate input
    // 2. Find user by email
    // 3. Compare password
    // 4. Generate JWT token
    // 5. Set refresh token in Redis
    // 6. Return tokens

    res.json({
      success: true,
      accessToken: 'jwt_token_here',
      refreshToken: 'refresh_token_here',
    });
  } catch (error) {
    logger.error(error);
    res.status(401).json({ error: 'Login failed' });
  }
});

// POST /auth/logout
app.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    // TODO: Implement logout
    // 1. Invalidate refresh token in Redis
    // 2. Return success

    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============================================
// ORGANIZATION ROUTES
// ============================================

// GET /organizations
app.get('/organizations', async (req: Request, res: Response) => {
  try {
    // TODO: Implement
    // 1. Get user from token
    // 2. Get organizations where user is member
    // 3. Return list

    res.json({
      success: true,
      organizations: [],
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// POST /organizations
app.post('/organizations', async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;

    // TODO: Implement
    // 1. Validate input
    // 2. Create organization
    // 3. Add creator as admin
    // 4. Return organization

    res.status(201).json({
      success: true,
      organization: {
        id: 'org_123',
        name,
        slug,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// ============================================
// BILLING ROUTES
// ============================================

// GET /billing/subscription
app.get('/billing/subscription', async (req: Request, res: Response) => {
  try {
    // TODO: Implement
    // 1. Get organization from request
    // 2. Get active subscription from DB or Stripe
    // 3. Return subscription details

    res.json({
      success: true,
      subscription: {
        plan: 'starter',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ============================================
// SERVER STARTUP
// ============================================

async function start() {
  try {
    // Test DB connection
    const result = await db.query('SELECT NOW()');
    logger.info('Database connected:', result.rows[0]);

    // Test Redis connection
    await redis.connect();
    logger.info('Redis connected');

    // Start server
    app.listen(port, () => {
      logger.info(`🚀 AIBOS Core Platform running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
