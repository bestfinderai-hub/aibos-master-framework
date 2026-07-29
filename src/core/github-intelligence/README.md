# GitHub Intelligence Engine (DEL 5)

Automatic daily monitoring of GitHub for trending repos, security issues, and tech trends.

## Features

✅ **Trending Detection** — Find popular repos in AI, Backend, Data, Security, Frontend  
✅ **Security Scanning** — License compliance, CVE tracking, dependency alerts  
✅ **Assessment Engine** — 9-question evaluation framework  
✅ **Decision Matrix** — Migrate / Integrate / Monitor / Ignore  
✅ **Reports** — Markdown + JSON results  

## Quick Start

```bash
# Set GitHub token
export GITHUB_TOKEN=ghp_xxx...

# Run intelligence analysis
npm run github-intelligence

# CLI help
node cli.js help
```

## Architecture

```
RepoAssessor          — Evaluates individual repos (9 questions)
SearchEngine          — Finds trending repos by category
IntelligenceRunner    — Orchestrates full analysis
CLI                   — Command-line interface
```

## Decision Matrix

| Repo Quality | Our Solution | Action |
|---|---|---|
| ⭐⭐⭐ Excellent | Mediocre | **MIGRATE** |
| ⭐⭐⭐ Excellent | Good | **INTEGRATE** |
| ⭐⭐ Good | Mediocre | EVALUATE |
| ⭐ OK | Mediocre | MONITOR |
| ⭐ OK | Good | IGNORE |

## Output

Results stored in `data/github-intelligence/`:
- `assessments-YYYY-MM-DD.json` — Raw assessment data
- `report-YYYY-MM-DD.md` — Executive report

## The 9 Questions

1. Better than our solution?
2. Can we use it?
3. License OK?
4. Actively maintained?
5. Star rating (maturity)?
6. Contributor quality?
7. Development speed?
8. User sentiment?
9. What should we do?

## Categories Monitored

- **AI/ML** — Agents, LLMs, prompts
- **Backend** — APIs, auth, billing
- **Data** — Pipelines, analytics, observability
- **Security** — GDPR, compliance, threat detection
- **Frontend** — UI, frameworks, components

## Production Deployment

Runs via GitHub Actions daily at 06:00 UTC:

```yaml
# .github/workflows/github-intelligence.yml
schedule:
  - cron: '0 6 * * *'  # Daily at 06:00 UTC
```

---

**Version**: 1.0  
**Status**: ✅ COMPLETE  
**Next**: DEL 6 — Code Standard & Development Workflow
