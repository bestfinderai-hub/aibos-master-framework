/**
 * GitHub Search Engine
 * Finds relevant trending repositories
 */

const axios = require('axios');

class GitHubSearchEngine {
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
   * Search for repositories matching criteria
   */
  async search(query, options = {}) {
    const {
      minStars = 100,
      languages = ['javascript', 'python', 'go'],
      maxAgeMonths = 3,
      sortBy = 'stars',
      limit = 30
    } = options;

    const recentDate = this.getDateOffset(maxAgeMonths);
    const languageFilter = languages.map(l => `language:${l}`).join(' ');

    const q = `${query} ${languageFilter} stars:>${minStars} pushed:>=${recentDate}`;

    try {
      const response = await this.client.get('/search/repositories', {
        params: {
          q,
          sort: sortBy,
          order: 'desc',
          per_page: Math.min(limit, 100)
        }
      });

      return response.data.items.map(item => ({
        owner: item.owner.login,
        name: item.name,
        url: item.html_url,
        stars: item.stargazers_count,
        description: item.description,
        language: item.language,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  /**
   * Trending repos in AI/ML category
   */
  async getTrendingAI() {
    return this.search('AI agents LLM prompt engineering', {
      minStars: 50,
      languages: ['python', 'javascript'],
      maxAgeMonths: 1,
      limit: 20
    });
  }

  /**
   * Trending in backend/API
   */
  async getTrendingBackend() {
    return this.search('API gateway authentication billing', {
      minStars: 100,
      languages: ['javascript', 'go', 'python'],
      maxAgeMonths: 1,
      limit: 20
    });
  }

  /**
   * Trending in data/analytics
   */
  async getTrendingData() {
    return this.search('data pipeline analytics observability', {
      minStars: 50,
      languages: ['javascript', 'python', 'go'],
      maxAgeMonths: 1,
      limit: 20
    });
  }

  /**
   * Trending in security/compliance
   */
  async getTrendingSecurity() {
    return this.search('security GDPR compliance authentication', {
      minStars: 50,
      languages: ['javascript', 'python', 'go'],
      maxAgeMonths: 1,
      limit: 20
    });
  }

  /**
   * Trending in frontend
   */
  async getTrendingFrontend() {
    return this.search('frontend UI components framework', {
      minStars: 50,
      languages: ['javascript', 'typescript'],
      maxAgeMonths: 1,
      limit: 20
    });
  }

  /**
   * Run all trending searches
   */
  async getAllTrending() {
    const results = await Promise.all([
      this.getTrendingAI(),
      this.getTrendingBackend(),
      this.getTrendingData(),
      this.getTrendingSecurity(),
      this.getTrendingFrontend()
    ]);

    return {
      ai: results[0],
      backend: results[1],
      data: results[2],
      security: results[3],
      frontend: results[4],
      total: results.reduce((sum, r) => sum + r.length, 0),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper: Get date N months ago
   */
  getDateOffset(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split('T')[0];
  }

  /**
   * Dedup repos by name
   */
  dedup(repos) {
    const seen = new Set();
    return repos.filter(repo => {
      const key = `${repo.owner}/${repo.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = GitHubSearchEngine;
