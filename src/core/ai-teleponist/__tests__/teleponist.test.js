/**
 * AI Teleponist Tests
 */

const CallEngine = require('../../../src/core/ai-teleponist/call-engine');
const SentimentAnalyzer = require('../../../src/core/ai-teleponist/sentiment-analyzer');
const SalesMethodologyEngine = require('../../../src/core/ai-teleponist/sales-methodology');

describe('CallEngine', () => {
  let engine, analyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
    engine = new CallEngine(analyzer);
  });

  test('should start inbound call', async () => {
    const call = await engine.handleInboundCall({
      id: 'call-123',
      caller: '+46701234567'
    });

    expect(call.id).toBe('call-123');
    expect(call.type).toBe('inbound');
    expect(call.status).toBe('active');
  });

  test('should start outbound call', async () => {
    const call = await engine.handleOutboundCall({
      leadId: 'lead-456',
      phone: '+46701234567'
    });

    expect(call.type).toBe('outbound');
    expect(call.status).toBe('dialing');
  });

  test('should process call segment', async () => {
    await engine.handleInboundCall({ id: 'call-123', caller: '+46701234567' });
    const result = await engine.processSegment('Hello, how can I help you today?');

    expect(result.sentiment).toBeDefined();
    expect(result.intent).toBeDefined();
    expect(engine.activeCall.transcript).toContain('Hello');
  });
});

describe('SentimentAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  test('should detect positive sentiment', () => {
    const result = analyzer.analyzeSegment('This is great, I love it!');
    expect(result.sentiment).toBeGreaterThan(70);
  });

  test('should detect negative sentiment', () => {
    const result = analyzer.analyzeSegment('This is terrible and awful!');
    expect(result.sentiment).toBeLessThan(30);
  });

  test('should detect buy intent', () => {
    const result = analyzer.analyzeSegment('I want to buy this product');
    expect(result.intent).toBe('buy');
  });

  test('should detect objections', () => {
    const result = analyzer.analyzeSegment('The price is too expensive');
    expect(result.objections).toContain('price');
  });
});

describe('SalesMethodologyEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new SalesMethodologyEngine();
  });

  test('should analyze BANT questions', () => {
    const result = engine.analyzeForMethodology('What is your budget for this?', 'bant');
    expect(result.found.budget).toBe(true);
  });

  test('should detect authority', () => {
    const result = engine.analyzeForMethodology('Can you make the decision?', 'bant');
    expect(result.found.authority).toBe(true);
  });

  test('should track BANT coverage', () => {
    engine.analyzeForMethodology('What is your budget?', 'bant');
    engine.analyzeForMethodology('Who makes the decision?', 'bant');
    engine.analyzeForMethodology('What do you need?', 'bant');

    const method = engine.methodologies.bant;
    const coverage = engine.getBACoverage(method);
    expect(coverage.categories).toBe(3);
  });
});
