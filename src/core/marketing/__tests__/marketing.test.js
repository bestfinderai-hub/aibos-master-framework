/**
 * Marketing Intelligence Tests
 */

const ContentGenerator = require('../../../src/core/marketing/content-generator');
const SEOIntelligence = require('../../../src/core/marketing/seo-intelligence');
const CampaignManager = require('../../../src/core/marketing/campaign-manager');

describe('ContentGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new ContentGenerator({
      generate: jest.fn().mockResolvedValue('Generated content')
    });
  });

  test('should extract blog title', () => {
    const title = generator.extractTitle('# My Blog Post\\n\\nContent');
    expect(title).toBe('My Blog Post');
  });

  test('should generate meta description', () => {
    const text = 'This is a great blog post. More content here.';
    const desc = generator.generateMetaDescription(text);
    expect(desc).toContain('This is a great blog post.');
  });

  test('should calculate keyword density', () => {
    const text = 'SEO is important. SEO helps ranking. Learn SEO today.';
    const density = generator.calculateKeywordDensity(text, 'SEO');
    expect(parseFloat(density)).toBeGreaterThan(10);
  });

  test('should extract email variables', () => {
    const text = 'Hi {{firstName}}, your company {{company}} rocks!';
    const vars = generator.extractVariables(text);
    expect(vars).toContain('firstName');
    expect(vars).toContain('company');
  });
});

describe('SEOIntelligence', () => {
  let seo;

  beforeEach(() => {
    seo = new SEOIntelligence();
  });

  test('should track keyword ranking', () => {
    const ranking = seo.trackRanking('AI platform', 5, 8);
    expect(ranking.rank).toBe(5);
    expect(ranking.change).toBe(-3);
    expect(ranking.trend).toBe('improving');
  });

  test('should detect ranking decline', () => {
    seo.trackRanking('SEO tips', 15, 8);
    const ranking = seo.rankings.get('SEO tips');
    expect(ranking.trend).toBe('declining');
  });

  test('should find competitor gaps', () => {
    const myKeywords = ['AI', 'ML', 'NLP'];
    const theirKeywords = ['AI', 'ML', 'Data Science'];

    const gaps = seo.findCompetitorGaps(myKeywords, theirKeywords);
    expect(gaps.missing).toContain('Data Science');
    expect(gaps.advantage).toContain('NLP');
  });

  test('should analyze headings', () => {
    const content = '# H1\\n## H2\\n### H3';
    const analysis = seo.analyzeHeadings(content);
    expect(analysis.h1).toBe(1);
    expect(analysis.h2).toBe(1);
  });
});

describe('CampaignManager', () => {
  let manager;

  beforeEach(() => {
    manager = new CampaignManager();
  });

  test('should create campaign', () => {
    const campaign = manager.createCampaign('Welcome Series', { type: 'nurture' });
    expect(campaign.name).toBe('Welcome Series');
    expect(campaign.status).toBe('draft');
  });

  test('should launch campaign', () => {
    const campaign = manager.createCampaign('Test', {});
    const result = manager.launchCampaign(campaign.id, { recipients: ['user@example.com'] });
    expect(result.recipientCount).toBe(1);
  });

  test('should update metrics', () => {
    const campaign = manager.createCampaign('Test', {});
    manager.updateMetrics(campaign.id, 'send');
    manager.updateMetrics(campaign.id, 'open');
    manager.updateMetrics(campaign.id, 'click');

    const perf = manager.getPerformance(campaign.id);
    expect(perf.sent).toBe(1);
    expect(perf.opened).toBe(1);
  });

  test('should setup A/B test', () => {
    const campaign = manager.createCampaign('AB Test', {});
    const variants = manager.setupABTest(campaign.id, [
      { name: 'Variant A', subject: 'Subject A' },
      { name: 'Variant B', subject: 'Subject B' }
    ]);

    expect(variants.length).toBe(2);
  });

  test('should calculate ROI', () => {
    const campaign = manager.createCampaign('Test', { recipients: ['user1', 'user2'] });
    manager.updateMetrics(campaign.id, 'convert');
    manager.updateMetrics(campaign.id, 'convert');

    const perf = manager.getPerformance(campaign.id);
    expect(parseFloat(perf.roi)).toBeGreaterThan(0);
  });
});
