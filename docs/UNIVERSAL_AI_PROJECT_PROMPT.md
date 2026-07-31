# Universal AI Project Prompt

## DEL 19: Generic Prompt for Any New AI Project Bootstrapping

**Status**: Production Ready  
**Version**: 1.0  
**Date**: 2026-07-31

---

## 🎯 Purpose

A generic, copy-paste prompt that works for ANY new AI-powered software project. Use this to bootstrap projects faster and ensure consistency across all initiatives.

**Key Benefits:**
- Faster project onboarding
- Consistent quality standards
- Clear expectations for AI collaboration
- No reinventing the wheel

---

## 📋 The Universal Prompt

```markdown
# [PROJECT_NAME] — AI Development Bootstrap

## Project Brief

**Name**: [Project Name]  
**Owner**: [Your Name]  
**Goal**: [One sentence describing the core objective]  
**Timeline**: [Weeks/Months to launch]  
**Success Criteria**: [3-5 measurable outcomes]

Example:
```
Name: OnlineJobb.se
Owner: BestFinder
Goal: Build the best job platform for short-term gig work in Sweden
Timeline: 12 weeks to MVP
Success Criteria:
- 50+ jobs active within 2 weeks
- 100+ registered workers
- 10+ successful job completions
- 4.5+ star rating from workers
- Profitable at €0.15/transaction
```

---

## Stack & Tech

### Backend
- **Language**: [Node.js / Python / Go]
- **Framework**: [Express / FastAPI / Gin]
- **Database**: [PostgreSQL / MongoDB / Redis]
- **Auth**: [JWT / OAuth / Custom]
- **API Style**: [REST / GraphQL]

### Frontend
- **Framework**: [React / Vue / Next.js]
- **Styling**: [Tailwind / Material / Custom]
- **State**: [Redux / Zustand / Context]
- **Deployment**: [Vercel / Netlify]

### Infrastructure
- **Hosting**: [Vercel / Railway / AWS]
- **Database**: [Supabase / AWS RDS]
- **Storage**: [S3 / Cloud Storage]
- **Email**: [Resend / Sendgrid]
- **Monitoring**: [Sentry / DataDog]

### AI/LLM
- **LLM**: [Claude / GPT-4 / Llama]
- **Embeddings**: [OpenAI / Cohere]
- **Vector DB**: [Pinecone / Weaviate]
- **Orchestration**: [LangChain / LlamaIndex]

---

## Project Structure

```
[project-name]/
├── docs/
│   ├── API.md              # API documentation
│   ├── ARCHITECTURE.md     # System design
│   └── DEPLOYMENT.md       # Deployment guide
├── src/
│   ├── api/                # API routes
│   ├── lib/                # Core logic
│   ├── modules/            # Feature modules
│   ├── services/           # External integrations
│   └── types/              # TypeScript interfaces
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── .eslintrc.js            # Linting rules
└── README.md               # Project documentation
```

---

## Core Principles

### 1. **MVP First**
- Launch with 20% of features (80% value)
- Iterate based on user feedback
- Add complexity only when needed
- Measure before optimizing

### 2. **Security by Default**
- Validate all user input
- Hash passwords (bcrypt/argon2)
- Use HTTPS everywhere
- Rotate secrets quarterly
- Audit log all sensitive actions

### 3. **Performance Matters**
- Target < 500ms p99 latency
- Cache aggressively
- Batch database operations
- Use CDN for static assets
- Monitor real-time metrics

### 4. **Test Everything**
- Unit tests: >80% coverage
- Integration tests for workflows
- E2E tests for critical paths
- Performance tests (ab, K6)
- Load test before launch

### 5. **Ship Early, Iterate Fast**
- 2-week sprints
- Deploy to staging every day
- Production releases weekly
- Rollback capability required
- Feature flags for experiments

---

## Development Workflow

### Week 1: Foundation
- [ ] Set up repository and CI/CD
- [ ] Configure database and auth
- [ ] Create core API scaffolding
- [ ] Set up monitoring & logging
- [ ] Deploy to staging

### Week 2-4: Core Features
- [ ] Implement primary workflows
- [ ] Build admin dashboard
- [ ] Add user onboarding
- [ ] Integrate payments (if needed)
- [ ] Comprehensive testing

### Week 5-6: Polish & QA
- [ ] Performance testing & optimization
- [ ] Security audit
- [ ] Accessibility review (WCAG 2.1)
- [ ] UX testing with users
- [ ] Documentation

### Week 7: Launch Prep
- [ ] Final security review
- [ ] Load testing (at 10x expected)
- [ ] Data backup strategy
- [ ] Incident response plan
- [ ] Monitor & alert rules

### Week 8: Launch
- [ ] Soft launch to beta users
- [ ] Monitor error rates & latency
- [ ] Scale if needed
- [ ] Celebrate! 🎉

---

## AI/LLM Integration Checklist

If using LLMs (Claude, GPT-4, etc):

- [ ] **Prompt Engineering**: Craft clear, specific system prompts
- [ ] **Context Management**: Keep conversation history lean (<4K tokens)
- [ ] **Error Handling**: Graceful fallbacks when LLM fails
- [ ] **Cost Management**: Log tokens, set budget alerts
- [ ] **Quality Gates**: Validate LLM outputs before using
- [ ] **User Feedback**: Collect ratings on LLM responses
- [ ] **Fine-tuning**: Train custom models if >10K API calls/day

### Sample LLM Usage
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function analyzeUserFeedback(feedback: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: 'You are a customer feedback analyst. Classify feedback as: positive, neutral, or negative. Explain the sentiment.',
    messages: [
      {
        role: 'user',
        content: feedback,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

---

## Quality Standards

### Code Quality
- TypeScript strict mode enabled
- ESLint zero warnings
- Prettier auto-formatting
- No commented-out code
- Comprehensive error messages

### Testing
- Unit test every function
- Integration tests for workflows
- E2E tests for user journeys
- Performance tests before launch
- Load tests at 10x capacity

### Security
- No secrets in code
- All inputs validated
- SQL injection impossible
- XSS prevention enabled
- CORS properly configured

### Performance
- API responses < 500ms (p99)
- Frontend load time < 3s
- Database queries optimized
- Caching strategy in place
- CDN for static assets

### Documentation
- README with quick start
- API documentation (OpenAPI)
- Architecture diagram
- Deployment runbook
- Troubleshooting guide

---

## Deployment Checklist

Before launching to production:

### Code
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed by 1+ person
- [ ] Performance benchmarked

### Infrastructure
- [ ] Database backed up
- [ ] Monitoring & alerts active
- [ ] Error tracking enabled
- [ ] Logging centralized
- [ ] CDN configured

### Security
- [ ] HTTPS enforced
- [ ] Environment secrets set
- [ ] Rate limiting enabled
- [ ] CORS whitelist configured
- [ ] Security headers set

### Operations
- [ ] Runbook documented
- [ ] Incident response plan ready
- [ ] On-call rotation established
- [ ] Rollback procedure tested
- [ ] Scaling plan in place

---

## Monitoring & Observability

### Key Metrics to Track
```typescript
interface Metrics {
  // Performance
  latency_p50: number;     // Median response time
  latency_p99: number;     // 99th percentile
  errorRate: number;       // % of failed requests
  throughput: number;      // Requests per second

  // Business
  activeUsers: number;     // Daily active users
  signups: number;         // New sign-ups
  conversionRate: number;  // % of users completing action
  churnRate: number;       // % of users leaving

  // Infrastructure
  cpuUsage: number;        // CPU percentage
  memoryUsage: number;     // Memory percentage
  diskUsage: number;       // Disk percentage
  databaseConnections: number;
}
```

### Alerting Rules
```
- If error_rate > 5% for 5 min → Alert on-call
- If latency_p99 > 2s for 10 min → Alert team
- If disk_usage > 80% → Alert ops
- If activeUsers drops >20% → Alert product team
```

---

## Roadmap Template

### Phase 1: MVP (Weeks 1-4)
- [ ] Core feature 1
- [ ] Core feature 2
- [ ] User authentication
- [ ] Basic analytics

### Phase 2: Scale (Weeks 5-8)
- [ ] Performance optimization
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Social features

### Phase 3: Expansion (Weeks 9-12)
- [ ] Mobile app
- [ ] API for partners
- [ ] Marketplace
- [ ] Automation

### Phase 4: Excellence (Ongoing)
- [ ] AI-powered features
- [ ] Personalization
- [ ] Global expansion
- [ ] Enterprise features

---

## Common Gotchas

### 1. N+1 Query Problem
```typescript
// ❌ Bad: Query in loop
users.forEach(user => {
  const posts = db.query('SELECT * FROM posts WHERE userId = ?', user.id);
});

// ✅ Good: Single batch query
const posts = db.query('SELECT * FROM posts WHERE userId IN (?)', userIds);
```

### 2. Missing Error Handling
```typescript
// ❌ Bad: Unhandled promise rejection
api.fetchData().then(data => console.log(data));

// ✅ Good: Proper error handling
try {
  const data = await api.fetchData();
  console.log(data);
} catch (error) {
  logger.error('Failed to fetch data', error);
  res.status(500).json({ error: 'Service unavailable' });
}
```

### 3. Hardcoded Secrets
```typescript
// ❌ Bad
const apiKey = 'sk-1234567890abcdef';

// ✅ Good
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not set');
```

### 4. Not Testing Edge Cases
```typescript
// ❌ Bad: Only test happy path
test('should calculate discount', () => {
  expect(calculateDiscount(10, 100)).toBe(90);
});

// ✅ Good: Test edge cases
test('should handle zero quantity', () => {
  expect(calculateDiscount(0, 100)).toBe(100);
});
test('should handle negative amount', () => {
  expect(() => calculateDiscount(10, -100)).toThrow();
});
```

---

## Resources

### Documentation
- [CLAUDE_CODE_MASTER_PROMPT.md](CLAUDE_CODE_MASTER_PROMPT.md) — AI development guidelines
- [AIBOS Constitution](AIBOS_CONSTITUTION.md) — Company values & principles
- Anthropic Docs: https://docs.anthropic.com
- TypeScript Handbook: https://www.typescriptlang.org/docs

### Tools
- TypeScript: `npm install -D typescript`
- ESLint: `npm install -D eslint @typescript-eslint/eslint-plugin`
- Jest: `npm install -D jest @types/jest ts-jest`
- Prettier: `npm install -D prettier`

### Templates
- Next.js starter: `npx create-next-app`
- Express starter: `npm init` + `npm install express`
- Database: `docker run -d postgres`

---

## Questions to Answer at Kickoff

1. **User**: Who are your primary users? What's their biggest pain point?
2. **Market**: Is there a competitor? What will make yours better?
3. **Business**: What's the revenue model? How will you measure success?
4. **Timeline**: When do you need to launch? What's the MVP?
5. **Team**: Who's building? What are their strengths?
6. **Technology**: Any constraints (legacy systems, compliance, performance)?
7. **Data**: What's the biggest data concern? Privacy? Scale?
8. **Risks**: What's the biggest risk to success? How will you mitigate?

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial release (DEL 19) |

---

**Next Step**: Copy this template, fill in your specifics, and use as the North Star for your project.
```
