# DEL 6 — Code Standard & AI Development Workflow

## 📚 Vision

AIBOS développement är **AI-guided, disciplined, och consistent**. Alla projekt följer samma:
- **Coding standards** (naming, structure, testing)
- **Development workflow** (branch strategy, CI/CD, quality gates)
- **AI-assisted patterns** (prompts, chunks, async patterns)
- **Quality metrics** (coverage, performance, security)

## 🎯 Core Principles

### 1. Code Quality
- **Typing**: TypeScript everywhere (strict mode)
- **Naming**: Clear, self-documenting names (no abbreviations)
- **Structure**: Modular, DRY, single responsibility
- **Testing**: 80%+ coverage (unit + integration + E2E)

### 2. Development Workflow
- **Branches**: `main` (prod) ← `dev` ← `feature/*` branches
- **Commits**: Atomic, descriptive, signed
- **PR Reviews**: Automated checks + human review (2 approvals)
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)

### 3. Performance
- **Bundle size**: < 100KB for frontends (gzipped)
- **API latency**: p95 < 200ms
- **Database queries**: < 50ms each
- **Memory**: < 256MB baseline

### 4. Security
- **Secrets**: Vault, never in code
- **OWASP**: Top 10 compliance
- **Scanning**: npm audit, SAST, dependency check
- **Auth**: OAuth2 + MFA

## 🛠️ Development Workflow

```
1. Feature Branch (from dev)
   ↓
2. Code + Tests (AI-guided)
   ↓
3. Local Verification
   - npm run lint ✅
   - npm run test ✅
   - npm run build ✅
   ↓
4. Push to GitHub
   ↓
5. GitHub Actions (Automated)
   - Lint check
   - Security scan
   - Unit tests (80%+ coverage)
   - Build verification
   - Performance benchmarks
   ↓
6. Code Review (2 approvals)
   - Logic review
   - Security review
   - Performance review
   ↓
7. Merge to dev
   ↓
8. Staging Deployment
   - E2E tests
   - Load tests
   - Security audit
   ↓
9. Release (merge dev → main)
   ↓
10. Production Deployment
    - Blue-green deploy
    - Gradual rollout
    - Monitoring + alerts
    - Rollback plan
```

## 📋 Coding Standards

### JavaScript/TypeScript

**File Structure**:
```
src/
├── services/         # Business logic
├── components/       # React components
├── utils/            # Shared utilities
├── types/            # TypeScript interfaces
├── hooks/            # Custom React hooks
├── middleware/       # Express/API middleware
└── __tests__/        # Test files
```

**Naming Convention**:
```javascript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_TIMEOUT_MS = 5000;

// Functions: camelCase
async function fetchUserData(userId) { }

// Classes: PascalCase
class RepoAssessor { }

// React Components: PascalCase
function UserProfile() { }

// Files: kebab-case
// src/services/repo-assessor.js
// src/components/user-profile.jsx
```

**TypeScript Strict Mode**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Testing Standards

**Unit Tests** (Jest):
```javascript
describe('RepoAssessor', () => {
  test('should rate 5k stars as Excellent', () => {
    const assessor = new RepoAssessor(token);
    const rating = assessor.rateByStars(5000);
    expect(rating).toBe('⭐⭐⭐ Excellent');
  });
});
```

**Integration Tests**:
- Database interactions
- API endpoints
- Third-party integrations

**E2E Tests** (Playwright):
- User workflows
- Critical paths
- Cross-browser testing

**Coverage Requirements**:
- Functions: 90%+
- Lines: 85%+
- Branches: 80%+

## 🤖 AI-Guided Development

### Claude/AI Assistant Usage

**When to use AI**:
- Boilerplate code (routes, CRUD operations)
- Testing (test case generation)
- Documentation (README, API docs)
- Refactoring (code cleanup)
- Bug analysis (error investigation)

**When NOT to use AI**:
- Security-critical code (review manually)
- Complex algorithms (require reasoning)
- Business logic (domain expert review)
- Performance-critical paths (benchmark manually)

### Prompt Template for AI Coding

```
Context:
- Project: AIBOS Framework
- Module: [NAME]
- Language: TypeScript
- Framework: Express / React / Next.js

Task:
Implement [FEATURE] with:
- Type safety (strict TypeScript)
- Error handling (try/catch, validation)
- Testing (unit + integration)
- Documentation (JSDoc comments)

Requirements:
- [Requirement 1]
- [Requirement 2]
- Performance: [Benchmark]
- Security: [Considerations]

Output:
- Code file
- Test file
- README section
```

## 🔄 Git Workflow

### Branch Naming
```
feature/user-auth          # New feature
bugfix/login-crash         # Bug fix
refactor/api-structure     # Refactoring
docs/setup-guide           # Documentation
chore/update-deps          # Maintenance
```

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>

Example:
feat(auth): add OAuth2 provider support

Implement OAuth2 integration for Google and GitHub.
Includes:
- OAuth2 client setup
- Token management
- User profile sync

Closes #123

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code reorganization
- `perf`: Performance improvement
- `test`: Test additions/updates
- `chore`: Maintenance tasks

## 📊 Metrics & Monitoring

### Code Quality Metrics
```
Metric                | Target | Tool
---                   | ---    | ---
Test Coverage         | 80%+   | Jest
Code Duplication      | < 3%   | SonarQube
Cyclomatic Complexity | < 10   | ESLint
Maintainability Index | > 85   | CodeMaat
```

### Performance Metrics
```
API Response Time     | < 200ms (p95)
Page Load Time        | < 3s
Bundle Size          | < 100KB (gzipped)
Memory Usage         | < 256MB
CPU Usage            | < 50%
```

### Security Metrics
```
Vulnerability Scans   | 0 critical
Outdated Dependencies | < 5%
License Compliance    | 100%
Secret Scans          | 0 exposed
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: npm install
      - run: npm run lint      # ESLint
      - run: npm run format    # Prettier
      - run: npm test          # Jest
      - run: npm run build     # TypeScript
      - run: npm run security  # npm audit, snyk
      
  performance:
    runs-on: ubuntu-latest
    steps:
      - run: npm run benchmark
      - run: npm run lighthouse
      
  deploy:
    needs: [quality, performance]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy:prod
```

## 📚 Documentation Standards

### JSDoc Comments
```javascript
/**
 * Assesses a GitHub repository against AIBOS criteria.
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Assessment>} Repository assessment
 * @throws {Error} If API rate limit exceeded
 * 
 * @example
 * const assessment = await assessor.assess('facebook', 'react');
 * console.log(assessment.decision); // 'MIGRATE_IMMEDIATELY'
 */
async function assess(owner, repo) { }
```

### README Structure
```
# Module Name

**Status**: [Alpha/Beta/Stable]  
**Version**: [X.Y.Z]

## Overview
[1-2 sentence description]

## Features
- Feature 1
- Feature 2

## Installation
[Install instructions]

## Usage
[Code examples]

## API Reference
[Function signatures]

## Testing
[How to run tests]

## Performance
[Benchmarks]

## Contributing
[Contribution guidelines]

## License
[License info]
```

## ✅ Quality Checklist

Before merge:
- [ ] Code follows naming conventions
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (0 warnings)
- [ ] Prettier formatting applied
- [ ] Tests pass (80%+ coverage)
- [ ] Build succeeds
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Commit messages descriptive
- [ ] 2 approvals received

## 🔧 Local Setup

```bash
# Install dependencies
npm install

# Setup pre-commit hooks
npx husky install

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Build project
npm run build

# Start development
npm run dev
```

## 📦 Dependencies

### Approved Libraries
- **Build**: esbuild, turbopack
- **Testing**: jest, vitest, playwright
- **Linting**: eslint, prettier
- **API**: axios, got
- **Database**: pg, prisma
- **Auth**: jsonwebtoken, bcrypt

### Maintenance Schedule
- Weekly: npm audit
- Monthly: dependency updates
- Quarterly: major version reviews

---

**Version**: 1.0  
**Status**: ✅ READY FOR IMPLEMENTATION  
**Next**: DEL 7 — Business Model & Go-to-Market
