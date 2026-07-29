# Development Setup Guide (DEL 6)

**Goal**: Get contributors up and running with AIBOS development in < 10 minutes.

## Prerequisites

- **Node.js**: 18.0.0+ ([download](https://nodejs.org/))
- **npm**: 9.0.0+
- **Git**: 2.0.0+
- **GitHub account** with SSH key configured
- **Code editor**: VS Code recommended

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/bestfinderai-hub/aibos-master-framework.git
cd aibos-framework
```

### 2. Install Dependencies
```bash
npm install
```

Installs all dev dependencies including ESLint, Prettier, Jest, TypeScript.

### 3. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your local config
```

### 4. Initialize Git Hooks
```bash
npx husky install
```

Pre-commit hooks will auto-lint and test before commits.

### 5. Run Quality Checks
```bash
# Lint all code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

All should pass ✅

### 6. Start Development
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Development Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Make Changes
```bash
# Edit code in src/
# Pre-commit hook will auto-lint + format
```

### Commit
```bash
git add .
git commit -m "feat(module): add my feature"
```

**Commit types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Push & Create PR
```bash
git push origin feature/my-feature
```

Open PR on GitHub. GitHub Actions will run full CI/CD.

### Review & Merge
1. ✅ All checks pass
2. ✅ 2 code reviews approve
3. ✅ Squash & merge to dev
4. ✅ Deploy to staging

---

## Quality Standards

### Code Style
- **Naming**: camelCase for functions, PascalCase for classes
- **Quotes**: Single quotes (ESLint enforces)
- **Line length**: 100 chars (Prettier enforces)
- **Indentation**: 2 spaces (no tabs)

### TypeScript
```javascript
// ✅ Good
async function fetchUserData(userId: string): Promise<UserData> {
  const user = await database.getUser(userId);
  if (!user) throw new Error('User not found');
  return user;
}

// ❌ Bad
async function fetch(id) {
  var user = await database.getUser(id)
  return user
}
```

### Testing
Every module needs tests:
```javascript
// src/services/user-service.js
describe('UserService', () => {
  test('should fetch user by ID', async () => {
    const user = await service.getUser('123');
    expect(user.id).toBe('123');
  });
});
```

Coverage target: **80%+**

### Error Handling
```javascript
// ✅ Good
try {
  await database.query(sql);
} catch (error) {
  logger.error('Query failed', { error, query: sql });
  throw new DatabaseError('Query execution failed', { cause: error });
}

// ❌ Bad
try {
  await database.query(sql);
} catch (error) {
  console.log('error');
}
```

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server (watch mode)
npm run start        # Start production server

# Quality
npm run lint         # Check code style
npm run lint:fix     # Auto-fix code style
npm run format       # Format with Prettier
npm run format:check # Check formatting

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:ci      # Run for CI/CD

# Building
npm run build        # Compile TypeScript
npm run security     # Audit dependencies

# Pre-commit
npm run precommit    # Run all checks (auto-runs before commit)
```

---

## Debugging

### VS Code Debug Configuration

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/index.js",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

Then press `F5` to start debugging.

### Enable Debug Logs
```bash
DEBUG=aibos:* npm run dev
```

---

## Troubleshooting

### Husky Hooks Not Running
```bash
npx husky install
chmod +x .husky/pre-commit
```

### Port Already in Use
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Failing
```bash
# Clear Jest cache
npm run test -- --clearCache

# Run single test file
npm run test -- src/services/__tests__/user.test.js
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npx tsc --noEmit

# Check for type issues
npm run build
```

---

## CI/CD Pipeline

GitHub Actions automatically runs:

1. **Linting** — ESLint + Prettier
2. **Testing** — Jest with coverage
3. **Security** — npm audit + secret scanning
4. **Build** — TypeScript compilation
5. **Quality Gate** — All must pass

If any fails, merge is blocked. Fix and push again.

---

## Performance Tips

### Development
- Use `npm run dev` for hot-reload
- Run `npm run test:watch` for test watch mode
- VS Code ESLint extension for real-time feedback

### Production
- Always run `npm run build` before deploying
- Check bundle size: `npm run build --verbose`
- Profile performance: `npm run benchmark`

---

## File Structure

```
src/
├── core/               # Core platform (stable)
│   ├── github-intelligence/  # DEL 5
│   ├── code-standard/        # DEL 6 (this)
│   └── ...
├── modules/            # Feature modules
│   ├── lead-intelligence/
│   ├── ai-telephones/
│   └── ...
├── services/           # Business logic
├── types/              # TypeScript interfaces
├── utils/              # Shared utilities
└── __tests__/          # Test files

docs/
├── architecture/       # System design
├── development/        # Dev guides (this file)
└── deployment/         # Deploy guides
```

---

## Additional Resources

- [AIBOS Architecture](../architecture/)
- [Code Standards](../architecture/DEL-6-code-standard.md)
- [Git Workflow](#git-workflow)
- [GitHub Issues](https://github.com/bestfinderai-hub/aibos-master-framework/issues)

---

**Questions?** Open an issue or reach out to the team.

**Last updated**: 2026-07-29
