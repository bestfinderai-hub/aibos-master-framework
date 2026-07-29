# DEL 6 — Code Standard & AI Development Workflow

## 🎯 Core Principle

**All code must be**:
- Readable (clear purpose)
- Maintainable (easy to fix)
- Testable (100% verifiable)
- Scalable (10x growth without rewrite)
- Documented (self-explanatory)

## 📋 AI Development Workflow (14 Steps)

Every AI feature goes through this process:

### **Step 1: Understand the Task** (30 min)
- Read requirements 3x
- Ask questions until 95%+ confident
- Identify edge cases
- Document assumptions

### **Step 2: Understand the Project** (1 hour)
- Read entire codebase (architecture, patterns)
- Understand module dependencies
- Know API contracts
- Understand database schema

### **Step 3: Identify Impact** (15 min)
- Which modules will change?
- Which APIs will be affected?
- Database migrations needed?
- Backward compatibility concerns?

### **Step 4: Identify Reuse** (30 min)
- Existing code we can reuse?
- Existing components?
- Existing libraries?
- Internal patterns?

### **Step 5: GitHub Research** (30 min)
- Better libraries out there?
- Better components?
- Better algorithms?
- Best practices?

### **Step 6: Plan the Solution** (1 hour)
- Create design doc
- List alternative approaches
- Pros/cons analysis
- Choose best approach
- Write pseudo-code

### **Step 7: Code** (2-4 hours)
- Follow code standard
- Minimal comments (code is self-documenting)
- Small functions (< 20 lines)
- Clear variable names

### **Step 8: Automated Tests** (1-2 hours)
- Unit tests (individual functions)
- Integration tests (modules together)
- API tests (HTTP contracts)
- Security tests (OWASP)
- Performance tests (load)

### **Step 9: Code Review** (1 hour)
- AI Code Reviewer (automated)
- AI Security Reviewer
- AI Architect Reviewer
- Human review (if needed)

### **Step 10: Documentation** (1 hour)
- Update API docs
- Update README
- Add code examples
- Document decisions

### **Step 11: Deploy to Staging** (15 min)
- Verify tests pass
- Verify no breaking changes
- Smoke tests
- Performance baseline

### **Step 12: Performance Analysis** (30 min)
- Latency (< 100ms?)
- Memory usage (< limit?)
- Database queries (optimized?)
- AI tokens (cost-effective?)

### **Step 13: Security Review** (30 min)
- OWASP check
- Input validation
- Authentication/authorization
- Secrets management
- Error handling (no stack traces)

### **Step 14: Production Deploy** (15 min)
- Blue-green deployment
- Monitor error rate
- Monitor latency
- Monitor resource usage
- Rollback plan ready

## ✅ Code Standard Checklist

### **Naming**
- [ ] Variables: lowercase_with_underscores (Python) or camelCase (JS)
- [ ] Functions: verb + noun (e.g., `getUser`, `fetchLeads`)
- [ ] Classes: PascalCase (e.g., `LeadService`, `UserManager`)
- [ ] Constants: UPPER_CASE (e.g., `MAX_RETRIES`, `API_TIMEOUT`)

### **Functions**
- [ ] Single responsibility (do one thing)
- [ ] Pure when possible (same input = same output)
- [ ] Max 20 lines per function
- [ ] Max 3 parameters
- [ ] Type hints (Python: `def func(x: str) -> int:`)

### **Errors**
- [ ] Never swallow exceptions silently
- [ ] Always log with context
- [ ] Return meaningful error messages
- [ ] No stack traces in API responses

### **Database**
- [ ] Parameterized queries (no SQL injection)
- [ ] Proper indexing (< 100ms queries)
- [ ] Transaction management
- [ ] Connection pooling

### **API**
- [ ] RESTful conventions
- [ ] Consistent error format
- [ ] Request validation
- [ ] Rate limiting
- [ ] Versioning (v1, v2, etc)

### **Comments**
- [ ] Only WHY, not WHAT
- [ ] No commented-out code
- [ ] Update comments with code changes

### **Git**
- [ ] Small commits (1 feature = 1 commit)
- [ ] Meaningful commit messages
- [ ] No merge commits (rebase)
- [ ] No secrets in commits

## 🧪 Test Strategy

Every feature needs:

| Type | Coverage | Command |
|------|----------|---------|
| Unit | 80%+ | `npm test` |
| Integration | 60%+ | `npm run test:integration` |
| API | 100% critical paths | `npm run test:api` |
| Security | All inputs | `npm run test:security` |
| Performance | Baseline | `npm run test:perf` |

## 📝 Definition of Done

A feature is DONE when:

```checklist
✅ Code written
✅ All tests passing
✅ Code reviewed & approved
✅ Security reviewed & approved
✅ Performance benchmarked
✅ Documentation updated
✅ Deployed to staging
✅ Smoke tests pass
✅ Rollback plan documented
✅ Deployed to production
✅ Monitoring alerts configured
✅ No customer incidents
```

---

**Version**: 1.0  
**Next**: DEL 7 — Business Model
