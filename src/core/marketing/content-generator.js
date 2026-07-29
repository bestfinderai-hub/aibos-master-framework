/**
 * Content Generation Service
 * AI-powered content creation (blog, email, landing pages)
 */

class ContentGenerator {
  constructor(aiClient) {
    this.ai = aiClient;
    this.templates = {
      emailWelcome: this.getEmailWelcomeTemplate(),
      emailNurture: this.getEmailNurtureTemplate(),
      emailReeengage: this.getEmailReengageTemplate(),
      blogPost: this.getBlogTemplate()
    };
  }

  /**
   * Generate blog post
   */
  async generateBlogPost(topic, keywords = [], style = 'professional') {
    const prompt = \Write a comprehensive blog post about \.
Target keywords: \.
Style: \.
Include: introduction, 3-4 sections, conclusion.
Length: 1500-2000 words.\;

    const post = await this.ai.generate(prompt);

    return {
      title: this.extractTitle(post),
      content: post,
      wordCount: post.split(' ').length,
      keywords,
      metaDescription: this.generateMetaDescription(post),
      readTime: Math.ceil(post.split(' ').length / 200)
    };
  }

  /**
   * Generate email campaign
   */
  async generateEmailCampaign(type, context = {}) {
    const template = this.templates[\email\\];
    if (!template) throw new Error('Unknown email type');

    const prompt = \Generate a compelling \ email for:
Company: \
Product: \
Tone: \\;

    const email = await this.ai.generate(prompt);

    return {
      type,
      subject: this.generateSubject(type, context),
      content: email,
      template,
      cta: this.extractCTA(email),
      variables: this.extractVariables(email)
    };
  }

  /**
   * Generate landing page copy
   */
  async generateLandingPageCopy(productName, benefit, audience = 'B2B') {
    const prompt = \Write compelling landing page copy for:
Product: \
Main benefit: \
Target audience: \
Include: headline, subheading, 3 benefits, CTA buttons.\;

    const copy = await this.ai.generate(prompt);

    return {
      headline: this.extractHeadline(copy),
      subheading: this.extractSubheading(copy),
      benefits: this.extractBenefits(copy),
      cta: this.extractCTA(copy),
      fullCopy: copy
    };
  }

  /**
   * Optimize content for SEO
   */
  async optimizeForSEO(content, targetKeyword) {
    return {
      keywordDensity: this.calculateKeywordDensity(content, targetKeyword),
      readabilityScore: this.calculateReadability(content),
      suggestions: {
        headings: this.suggestHeadings(content, targetKeyword),
        internalLinks: this.suggestInternalLinks(content),
        metaDescription: this.generateMetaDescription(content),
        ogTags: this.generateOGTags(content)
      }
    };
  }

  // Helper methods
  extractTitle(text) {
    const lines = text.split('\n');
    return lines[0]?.replace(/^#+\s*/, '') || 'Untitled';
  }

  generateMetaDescription(text) {
    const sentences = text.split('.');
    return (sentences[0] + '.')?.substring(0, 160);
  }

  generateSubject(type, context) {
    const subjects = {
      emailWelcome: \Welcome to \!\,
      emailNurture: \How \ helps \\,
      emailReengage: \We miss you! \\
    };
    return subjects[\email\\] || 'Check this out';
  }

  extractCTA(text) {
    const match = text.match(/\[([^\]]+)\]/);
    return match ? match[1] : 'Learn More';
  }

  extractVariables(text) {
    const vars = new Set();
    const matches = text.matchAll(/{{([^}]+)}}/g);
    for (const match of matches) vars.add(match[1]);
    return Array.from(vars);
  }

  calculateKeywordDensity(text, keyword) {
    const words = text.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(w => w.includes(keyword.toLowerCase())).length;
    return ((keywordCount / words.length) * 100).toFixed(2);
  }

  calculateReadability(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    return avgWordsPerSentence < 16 ? 'Good' : 'Could be better';
  }

  suggestHeadings(content, keyword) {
    return [
      \Understanding \\,
      \Why \ Matters\,
      \Best Practices for \\,
      \Getting Started with \\
    ];
  }

  suggestInternalLinks(content) {
    return ['Related article 1', 'Related article 2', 'Related article 3'];
  }

  generateOGTags(content) {
    return {
      'og:title': this.extractTitle(content),
      'og:description': this.generateMetaDescription(content),
      'og:image': 'https://example.com/image.jpg'
    };
  }

  // Email templates
  getEmailWelcomeTemplate() {
    return \
Hi {{firstName}},

Welcome to our community! We're excited to have you on board.

[Get Started] {{ctaLink}}

Best regards,
The Team
    \.trim();
  }

  getEmailNurtureTemplate() {
    return \
Hi {{firstName}},

We thought you'd like this:
{{contentSnippet}}

[Learn More] {{ctaLink}}

Cheers,
The Team
    \.trim();
  }

  getEmailReengageTemplate() {
    return \
Hi {{firstName}},

We've missed you! Here's a special offer just for you.

{{offer}}

[Claim Offer] {{ctaLink}}

Hope to see you soon!
The Team
    \.trim();
  }

  getBlogTemplate() {
    return \# {{title}}

{{introduction}}

## Section 1: {{heading1}}
{{content1}}

## Section 2: {{heading2}}
{{content2}}

## Conclusion
{{conclusion}}\;
  }
}

module.exports = ContentGenerator;
