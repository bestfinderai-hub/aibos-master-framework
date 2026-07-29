/**
 * GitHub Repository Assessment Engine
 * Evaluates open-source projects against AIBOS criteria
 */

const axios = require('axios');

class RepoAssessor {
  constructor(githubToken) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Assess a GitHub repository (9 questions)
   */
  async assess(owner, repo) {
    const repoData = await this.getRepoData(owner, repo);

    return {
      repo: `${owner}/${repo}`,
      link: repoData.html_url,
      stars: repoData.stargazers_count,
      contributors: await this.getContributorCount(owner, repo),
      lastCommit: repoData.pushed_at,
      license: repoData.license?.name || 'UNKNOWN',

      assessment: {
        betterThanOurs: await this.isBetter(repoData),
        canWeUse: await this.isCompatible(repoData),
        licenseOk: this.checkLicense(repoData.license?.spdx_id),
        isActive: this.isActive(repoData.pushed_at),
        starRating: this.rateByStars(repoData.stargazers_count),
        contributorQuality: await this.getContributorQuality(owner, repo),
        devSpeed: await this.getDevSpeed(owner, repo),
        userSentiment: await this.getUserSentiment(owner, repo),
      },

      decision: await this.makeDecision(owner, repo),
      timestamp: new Date().toISOString()
    };
  }

  async getRepoData(owner, repo) {
    const response = await this.client.get(`/repos/${owner}/${repo}`);
    return response.data;
  }

  async getContributorCount(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contributors?per_page=1`);
      return parseInt(response.headers['link']?.match(/&page=(\d+)>; rel="last"/)?.[1] || 1);
    } catch {
      return 0;
    }
  }

  /**
   * Question 1: Is it better than our solution?
   */
  async isBetter(repoData) {
    // Heuristics:
    // - 5k+ stars = mature
    // - Recent commits = actively maintained
    // - Multiple languages = versatile
    // - High forks = community adoption

    return (
      repoData.stargazers_count >= 5000 &&
      repoData.forks_count >= 100 &&
      repoData.open_issues_count <= 50
    );
  }

  /**
   * Question 2: Can we use it?
   */
  async isCompatible(repoData) {
    const langs = (repoData.language || '').toLowerCase();
    const hasNodeSupport = repoData.topics?.includes('nodejs') ||
                          repoData.topics?.includes('javascript');
    const hasApiDocs = repoData.description?.includes('API') ||
                       repoData.readme_length > 5000;

    return (langs && (hasNodeSupport || hasApiDocs));
  }

  /**
   * Question 3: Is license appropriate?
   */
  checkLicense(spdxId) {
    const GOOD_LICENSES = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'];
    const BAD_LICENSES = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'];

    if (BAD_LICENSES.includes(spdxId)) return 'BAD (GPL)';
    if (GOOD_LICENSES.includes(spdxId)) return 'GOOD';
    return 'UNKNOWN';
  }

  /**
   * Question 4: Is it actively maintained?
   */
  isActive(lastCommitDate) {
    const days = (new Date() - new Date(lastCommitDate)) / (1000 * 60 * 60 * 24);
    if (days < 30) return 'VERY_ACTIVE';
    if (days < 90) return 'ACTIVE';
    if (days < 180) return 'MODERATELY_ACTIVE';
    return 'INACTIVE';
  }

  /**
   * Question 5: Star rating
   */
  rateByStars(stars) {
    if (stars >= 10000) return '⭐⭐⭐ Excellent';
    if (stars >= 5000) return '⭐⭐⭐ Excellent';
    if (stars >= 1000) return '⭐⭐ Good';
    if (stars >= 100) return '⭐ OK';
    return '❌ Unknown';
  }

  /**
   * Question 6: Contributor quality
   */
  async getContributorQuality(owner, repo) {
    try {
      const response = await this.client.get(
        `/repos/${owner}/${repo}/contributors?per_page=10`
      );
      const topContributors = response.data.length;
      const avgCommits = response.data.reduce((sum, c) => sum + c.contributions, 0) / topContributors;

      return {
        topContributors,
        avgCommitsPerContributor: Math.round(avgCommits),
        quality: avgCommits > 50 ? 'HIGH' : 'MEDIUM'
      };
    } catch {
      return { topContributors: 0, avgCommitsPerContributor: 0, quality: 'UNKNOWN' };
    }
  }

  /**
   * Question 7: Development speed
   */
  async getDevSpeed(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/commits?per_page=100`);
      const commits = response.data;

      // Calculate commits per month from last 100 commits
      if (commits.length < 2) return { releasesPerMonth: 0, speed: 'SLOW' };

      const firstDate = new Date(commits[commits.length - 1].commit.author.date);
      const lastDate = new Date(commits[0].commit.author.date);
      const monthsSpan = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 30);
      const commitsPerMonth = commits.length / Math.max(monthsSpan, 1);

      return {
        commitsPerMonth: Math.round(commitsPerMonth),
        speed: commitsPerMonth > 10 ? 'FAST' : commitsPerMonth > 5 ? 'MEDIUM' : 'SLOW'
      };
    } catch {
      return { commitsPerMonth: 0, speed: 'UNKNOWN' };
    }
  }

  /**
   * Question 8: User sentiment
   */
  async getUserSentiment(owner, repo) {
    try {
      const response = await this.client.get(
        `/repos/${owner}/${repo}/issues?per_page=20&state=closed`
      );
      const closedIssues = response.data.filter(i => !i.pull_request);
      const avgCommentsPerIssue = closedIssues.reduce((sum, i) => sum + i.comments, 0) / closedIssues.length;

      // Heuristic: many comments on closed issues = active discussion = good sentiment
      return {
        avgCommentsPerIssue: Math.round(avgCommentsPerIssue),
        sentiment: avgCommentsPerIssue > 5 ? 'POSITIVE' : 'NEUTRAL'
      };
    } catch {
      return { avgCommentsPerIssue: 0, sentiment: 'UNKNOWN' };
    }
  }

  /**
   * Question 9: Make a decision
   */
  async makeDecision(owner, repo) {
    const assessment = await this.assess(owner, repo);
    const { assessment: a } = assessment;

    // Decision matrix
    if (a.betterThanOurs && a.canWeUse && a.licenseOk === 'GOOD') {
      return 'MIGRATE_IMMEDIATELY';
    }

    if (a.betterThanOurs && a.licenseOk === 'GOOD') {
      return 'INTEGRATE_AS_PLUGIN';
    }

    if (a.isActive === 'ACTIVE' && a.licenseOk !== 'BAD (GPL)') {
      return 'MONITOR';
    }

    return 'IGNORE';
  }
}

module.exports = RepoAssessor;
