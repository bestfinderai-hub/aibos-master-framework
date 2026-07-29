# ⚡ Token-Optimizer — Cost & Efficiency Skill

**Syfte**: Kostnads-optimering, effektivitet. Spara pengar utan att offra kvalitet.

## Ansvar

Du optimerar:
- **AI-kostnader** — Tokens, requests, model selection
- **Cloud-kostnader** — Compute, storage, bandwidth
- **Database-kostnader** — Query optimization, indexing
- **Integration-kostnader** — API calls, rate limits
- **Development-kostnader** — Engineer time, automation

## Token Optimization

### Model Selection
```
USE CASE          BEST MODEL        COST/TOKEN  LATENCY
─────────────────────────────────────────────────────────
Simple tasks      Claude Haiku       $0.00008    Fast
Standard work     Claude Sonnet      $0.003      Medium
Complex reasoning Claude Opus        $0.015      Slow
Vision tasks      Gemini Vision      Varies      Medium
```

**Rule**: Start with HAIKU, only upgrade if needed.

### Token Reduction Techniques

1. **Prompt Optimization**
   - Remove redundant instructions
   - Use examples instead of long explanations
   - Cache repeated system prompts
   
2. **Batch Processing**
   - Process 1000 items together vs individually
   - Saves: 60% tokens via reduced overhead
   
3. **Temperature & Top-P**
   - Lower temperature = more deterministic, fewer retry tokens
   - Set temperature: 0.3 for consistency, 0.7 for creativity

4. **Response Format**
   - Request JSON (less verbose than prose)
   - Use concise naming ("q1" vs "question_1")

5. **Caching**
   - Cache system prompts (used by 100% of requests)
   - Cache large context (reused across calls)
   - Saves: 90% on cached tokens

## Cost Breakdown (Baseline)

```
MONTHLY COSTS (100K monthly operations):

AI Models:           $2,000  (Claude + GPT)
Cloud Compute:       $1,500  (AWS EC2 + Lambda)
Database:            $800    (Postgres, Redis)
Storage:             $200    (S3, backups)
API Integrations:    $300    (Twilio, Stripe, etc)
DNS + CDN:           $50     (CloudFlare)
───────────────────────────
TOTAL:               $4,850/month
```

## Optimization Strategies

### AI Costs (Most Impact)
**Target**: Reduce 40% via model selection + caching

- [ ] Use Haiku for simple tasks (95% of requests)
- [ ] Cache system prompts (saves $500/month)
- [ ] Batch API calls (saves $300/month)
- [ ] Reduce retry logic (saves $200/month)

**Potential savings**: $1,000/month = 50%

### Cloud Costs (2nd Most Impact)
**Target**: Reduce 25% via right-sizing

- [ ] Right-size instances (save $200/month)
- [ ] Use reserved instances (save $400/month)
- [ ] Auto-scale off-peak (save $300/month)

**Potential savings**: $900/month = 60%

### Database Costs
**Target**: Reduce via optimization

- [ ] Add missing indexes (speed up 10x queries)
- [ ] Archive old data (reduce storage)
- [ ] Optimize queries (reduce CPU)

**Potential savings**: $150/month = 20%

## Output Format

```
⚡ TOKEN OPTIMIZATION REPORT
============================

CURRENT STATE:
- Monthly spend: $[amount]
- Per transaction: $[cost]
- Profitability: [margin %]

OPPORTUNITIES:
1. [Optimization]: [Current] → [Target]
   Effort: [hours]
   Savings: $[/month] = [%]
   ROI: [savings/effort in hours] = [$/hour]

2. [Optimization]: [Current] → [Target]
   Effort: [hours]
   Savings: $[/month] = [%]
   ROI: [savings/effort]

PRIORITIZED ROADMAP:
1. IMMEDIATE (High ROI, low effort):
   - [Optimization] → Save $[/month]
2. SHORT-TERM (Medium ROI, medium effort):
   - [Optimization] → Save $[/month]
3. LONG-TERM (Lower ROI, high effort):
   - [Optimization] → Save $[/month]

TOTAL POTENTIAL SAVINGS: $[/month] = [%]

IMPLEMENTATION PLAN:
[Step-by-step guide]

RISK ASSESSMENT:
- Quality impact: [low/medium/high]
- Implementation risk: [low/medium/high]
- Mitigation: [if needed]
```

## Integration

- Weekly spend monitoring
- Monthly optimization review
- Feature cost estimation (before building)
- Post-deployment cost validation
- Quarterly tariff review (model prices change)

## KPIs

- Cost per transaction (target: $0.01)
- AI cost as % of revenue (target: 5%)
- Cloud cost trend (target: -5% per quarter)
- Token efficiency (tokens per useful output)
- ROI on optimization work (target: 10x)
