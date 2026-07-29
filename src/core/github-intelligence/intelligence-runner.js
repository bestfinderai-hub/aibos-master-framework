/**
 * GitHub Intelligence Engine
 * Main orchestrator for continuous GitHub monitoring
 */

const RepoAssessor = require('./repo-assessor');
const SearchEngine = require('./search-engine');
const fs = require('fs').promises;
const path = require('path');

class GitHubIntelligence {
  constructor(githubToken) {
    this.assessor = new RepoAssessor(githubToken);
    this.searchEngine = new SearchEngine(githubToken);
    this.resultsDir = path.join(__dirname, '../../..', 'data/github-intelligence');
  }

  /**
   * Run full intelligence analysis
   */
  async run() {
    console.log('🔍 Starting GitHub Intelligence Engine...');

    try {
      // Step 1: Search for trending repos
      console.log('📡 Searching for trending repos...');
      const trending = await this.searchEngine.getAllTrending();

      // Step 2: Dedup and filter
      const allRepos = [
        ...trending.ai,
        ...trending.backend,
        ...trending.data,
        ...trending.security,
        ...trending.frontend
      ];
      const uniqueRepos = this.searchEngine.dedup(allRepos);

      console.log(`📊 Found ${uniqueRepos.length} unique repos, assessing...`);

      // Step 3: Assess each repo
      const assessments = [];
      const alerts = [];

      for (const repo of uniqueRepos.slice(0, 50)) {
        try {
          const assessment = await this.assessor.assess(repo.owner, repo.name);
          assessments.push(assessment);

          // Check if this needs attention
          if (!['IGNORE', 'MONITOR'].includes(assessment.decision)) {
            alerts.push(assessment);
          }

          // Rate limit: 1 request per second
          await this.sleep(1000);
        } catch (error) {
          console.warn(`⚠️ Error assessing ${repo.owner}/${repo.name}:`, error.message);
        }
      }

      // Step 4: Save results
      await this.saveResults(assessments);

      // Step 5: Generate report
      const report = this.generateReport(assessments, alerts);
      await this.saveReport(report);

      console.log(`✅ Analysis complete: ${assessments.length} repos assessed, ${alerts.length} alerts`);

      return {
        success: true,
        assessed: assessments.length,
        alerts: alerts.length,
        report
      };
    } catch (error) {
      console.error('❌ Intelligence engine failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save assessment results to database
   */
  async saveResults(assessments) {
    await this.ensureDir();

    const filename = `assessments-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.resultsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(assessments, null, 2));
    console.log(`💾 Saved ${assessments.length} assessments to ${filename}`);
  }

  /**
   * Generate intelligence report
   */
  generateReport(assessments, alerts) {
    const byDecision = {
      MIGRATE_IMMEDIATELY: assessments.filter(a => a.decision === 'MIGRATE_IMMEDIATELY'),
      INTEGRATE_AS_PLUGIN: assessments.filter(a => a.decision === 'INTEGRATE_AS_PLUGIN'),
      MONITOR: assessments.filter(a => a.decision === 'MONITOR'),
      IGNORE: assessments.filter(a => a.decision === 'IGNORE')
    };

    const licenseIssues = assessments.filter(
      a => a.assessment.licenseOk === 'BAD (GPL)'
    );

    const inactiveRepos = assessments.filter(
      a => a.assessment.isActive === 'INACTIVE'
    );

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalAssessed: assessments.length,
        migrate: byDecision.MIGRATE_IMMEDIATELY.length,
        integrate: byDecision.INTEGRATE_AS_PLUGIN.length,
        monitor: byDecision.MONITOR.length,
        ignore: byDecision.IGNORE.length,
        alerts: alerts.length
      },
      recommendations: {
        migrateImmediately: byDecision.MIGRATE_IMMEDIATELY.map(a => ({
          repo: a.repo,
          link: a.link,
          stars: a.stars,
          decision: a.decision,
          assessment: a.assessment
        })),
        integrateAsPlugin: byDecision.INTEGRATE_AS_PLUGIN.map(a => ({
          repo: a.repo,
          link: a.link,
          stars: a.stars
        }))
      },
      risks: {
        licenseIssues: licenseIssues.length,
        inactiveRepos: inactiveRepos.length,
        details: {
          licenses: licenseIssues.map(a => ({ repo: a.repo, license: a.license })),
          inactive: inactiveRepos.map(a => ({ repo: a.repo, lastCommit: a.lastCommit }))
        }
      }
    };
  }

  /**
   * Save report as markdown
   */
  async saveReport(report) {
    await this.ensureDir();

    const md = `# GitHub Intelligence Report

**Generated**: ${report.timestamp}

## 📊 Summary

- **Total Assessed**: ${report.summary.totalAssessed}
- **Migrate Immediately**: ${report.summary.migrate}
- **Integrate as Plugin**: ${report.summary.integrate}
- **Monitor**: ${report.summary.monitor}
- **Ignore**: ${report.summary.ignore}

## 🚀 Recommendations

### Migrate Immediately (${report.summary.migrate})
${report.recommendations.migrateImmediately.map(r =>
  `- [${r.repo}](${r.link}) (⭐ ${r.stars})`
).join('\n') || 'None'}

### Integrate as Plugin (${report.summary.integrate})
${report.recommendations.integrateAsPlugin.map(r =>
  `- [${r.repo}](${r.link}) (⭐ ${r.stars})`
).join('\n') || 'None'}

## ⚠️ Risks

- **License Issues**: ${report.risks.licenseIssues}
- **Inactive Repos**: ${report.risks.inactiveRepos}

---

*AIBOS GitHub Intelligence Engine*
`;

    const filename = `report-${new Date().toISOString().split('T')[0]}.md`;
    const filepath = path.join(this.resultsDir, filename);

    await fs.writeFile(filepath, md);
    console.log(`📄 Report saved to ${filename}`);
  }

  /**
   * Helper: ensure results directory exists
   */
  async ensureDir() {
    try {
      await fs.mkdir(this.resultsDir, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }
  }

  /**
   * Helper: sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = GitHubIntelligence;
