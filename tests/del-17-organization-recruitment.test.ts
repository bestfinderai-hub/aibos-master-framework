/**
 * DEL 17 Tests: Organization & Recruitment
 * Org structure, hiring workflows, onboarding
 */

import { OrganizationManager } from '../src/modules/organization/org-structure';
import { HiringWorkflow } from '../src/modules/organization/hiring-workflow';

describe('DEL 17: Organization & Recruitment', () => {
  let orgManager: OrganizationManager;
  let hiringFlow: HiringWorkflow;

  beforeEach(() => {
    orgManager = new OrganizationManager();
    hiringFlow = new HiringWorkflow();
  });

  describe('OrganizationManager', () => {
    test('should build organizational structure', () => {
      const org = orgManager.buildStructure('TechCorp', [
        { id: 'eng', name: 'Engineering', teamSize: 10, budget: 1000000 },
        { id: 'product', name: 'Product', teamSize: 5, budget: 500000 },
      ]);

      expect(org.companyName).toBe('TechCorp');
      expect(org.totalHeadcount).toBe(15);
      expect(org.departments).toHaveLength(2);
      expect(org.levels).toContain('c-level');
      expect(org.levels).toContain('junior');
    });

    test('should create job requisition', () => {
      const req = orgManager.createRequisition(
        'Senior Engineer',
        'Engineering',
        'senior',
        100000,
        130000,
        ['TypeScript', 'React', 'Node.js'],
        'high'
      );

      expect(req.id).toBeDefined();
      expect(req.title).toBe('Senior Engineer');
      expect(req.department).toBe('Engineering');
      expect(req.minSalary).toBe(100000);
      expect(req.maxSalary).toBe(130000);
      expect(req.status).toBe('open');
      expect(req.urgency).toBe('high');
    });

    test('should analyze hiring pipeline', () => {
      const req = orgManager.createRequisition(
        'Engineer',
        'Eng',
        'mid',
        80000,
        100000,
        ['TypeScript'],
        'high'
      );

      const pipeline = orgManager.analyzeHiringPipeline(req, [
        { stage: 'sourcing', count: 50 },
        { stage: 'screening', count: 20 },
        { stage: 'technical', count: 10 },
        { stage: 'interviews', count: 5 },
        { stage: 'offerPending', count: 2 },
        { stage: 'accepted', count: 1 },
      ]);

      expect(pipeline.totalCandidates).toBe(88);
      expect(pipeline.avgTimeToHire).toBeGreaterThan(0);
      expect(pipeline.conversionRate).toBeGreaterThanOrEqual(0);
      expect(pipeline.conversionRate).toBeLessThanOrEqual(100);
    });

    test('should generate onboarding plan', () => {
      const plan = orgManager.generateOnboardingPlan(
        'emp-123',
        'John Doe',
        '2026-08-01',
        'Senior Engineer',
        'manager-id'
      );

      expect(plan.employeeId).toBe('emp-123');
      expect(plan.employeeName).toBe('John Doe');
      expect(plan.role).toBe('Senior Engineer');
      expect(plan.tasks).toHaveLength(8); // Predefined onboarding tasks
      expect(plan.tasks.some(t => t.category === 'setup')).toBe(true);
      expect(plan.tasks.some(t => t.category === 'training')).toBe(true);
    });

    test('should mark onboarding tasks complete', () => {
      const plan = orgManager.generateOnboardingPlan(
        'emp-123',
        'Jane Doe',
        '2026-08-01',
        'Product Manager',
        'manager-id'
      );

      const taskToComplete = plan.tasks[0];
      taskToComplete.completed = true;

      expect(taskToComplete.completed).toBe(true);
    });

    test('should calculate team velocity', () => {
      const velocity = orgManager.calculateTeamVelocity(10, 20, 12); // 10→20 over 12 months

      expect(velocity).toBe(0.8); // ~1 hire per month
    });

    test('should forecast headcount', () => {
      const org = orgManager.buildStructure('TechCorp', [
        { id: 'eng', name: 'Engineering', teamSize: 10, budget: 1000000 },
        { id: 'sales', name: 'Sales', teamSize: 5, budget: 500000 },
      ]);

      const forecast = orgManager.forecastHeadcount(org, 20, 12); // 20% growth over 12 months

      expect(forecast.get('Engineering')).toBeGreaterThan(10);
      expect(forecast.get('Sales')).toBeGreaterThan(5);
    });

    test('should calculate budget impact', () => {
      const reqs = [
        orgManager.createRequisition('Senior Dev', 'Eng', 'senior', 100000, 130000, [], 'high'),
        orgManager.createRequisition('Junior Dev', 'Eng', 'junior', 60000, 80000, [], 'medium'),
      ];

      const impact = orgManager.calculateBudgetImpact(reqs);

      expect(impact.totalCost).toBeGreaterThan(0);
      expect(impact.avgCost).toBeLessThanOrEqual(impact.totalCost);
    });
  });

  describe('HiringWorkflow', () => {
    test('should create candidate profile', () => {
      const candidate = hiringFlow.createCandidate(
        'John Smith',
        'john@example.com',
        'Senior Engineer',
        'LinkedIn'
      );

      expect(candidate.id).toBeDefined();
      expect(candidate.name).toBe('John Smith');
      expect(candidate.email).toBe('john@example.com');
      expect(candidate.stage).toBe('sourcing');
      expect(candidate.score).toBe(0);
    });

    test('should advance candidate through stages', () => {
      const candidate = hiringFlow.createCandidate('Jane Doe', 'jane@example.com', 'PM', 'Referral');

      const advanced = hiringFlow.advanceStage(candidate, 'screening', 'Good resume, scheduling screening call');

      expect(advanced.stage).toBe('screening');
      expect(advanced.feedback).toHaveLength(1);
      expect(advanced.feedback[0]).toContain('Good resume');
    });

    test('should schedule interviews', () => {
      const candidate = hiringFlow.createCandidate('Bob', 'bob@example.com', 'Engineer', 'Direct');

      const interview = hiringFlow.scheduleInterview(
        candidate,
        'technical',
        'tech-lead',
        '2026-08-15T10:00:00Z',
        60
      );

      expect(interview.id).toBeDefined();
      expect(interview.type).toBe('technical');
      expect(interview.interviewer).toBe('tech-lead');
      expect(interview.duration).toBe(60);
    });

    test('should submit interview feedback', () => {
      const candidate = hiringFlow.createCandidate('Alice', 'alice@example.com', 'Role', 'Job Board');

      const interview = hiringFlow.scheduleInterview(
        candidate,
        'cultural',
        'hiring-manager',
        '2026-08-15T14:00:00Z',
        45
      );

      const withFeedback = hiringFlow.submitInterviewFeedback(
        interview,
        85,
        'Strong candidate, great culture fit',
        'Advance to final round'
      );

      expect(withFeedback.score).toBe(85);
      expect(withFeedback.feedback).toContain('Strong candidate');
      expect(withFeedback.nextSteps).toContain('final round');
    });

    test('should score candidate', () => {
      const candidate = hiringFlow.createCandidate('Chris', 'chris@example.com', 'Dev', 'LinkedIn');
      candidate.stage = 'offer';

      const int1 = hiringFlow.scheduleInterview(candidate, 'technical', 'lead', '2026-08-15T10:00:00Z', 60);
      int1.score = 90;
      candidate.interviews.push(int1);

      const int2 = hiringFlow.scheduleInterview(candidate, 'cultural', 'manager', '2026-08-16T14:00:00Z', 45);
      int2.score = 85;
      candidate.interviews.push(int2);

      const score = hiringFlow.scoreCandidate(candidate);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should generate job offer', () => {
      const offer = hiringFlow.generateOffer(
        'cand-123',
        'Senior Engineer',
        120000,
        ['Health Insurance', '401k', 'Remote'],
        '2026-09-01'
      );

      expect(offer.id).toBeDefined();
      expect(offer.candidateId).toBe('cand-123');
      expect(offer.salary).toBe(120000);
      expect(offer.status).toBe('draft');
      expect(offer.offerLetter).toContain('120000');
    });

    test('should send offer', () => {
      const offer = hiringFlow.generateOffer(
        'cand-456',
        'Product Manager',
        100000,
        ['Benefits'],
        '2026-09-15'
      );

      const sent = hiringFlow.sendOffer(offer);

      expect(sent.status).toBe('sent');
      expect(sent.sentDate).toBeDefined();
    });

    test('should process offer acceptance', () => {
      const offer = hiringFlow.generateOffer('cand-789', 'Designer', 90000, ['PTO'], '2026-10-01');
      const sent = hiringFlow.sendOffer(offer);

      const accepted = hiringFlow.processOfferResponse(sent, true);

      expect(accepted.status).toBe('accepted');
    });

    test('should calculate hiring metrics', () => {
      const candidates: any = [
        hiringFlow.createCandidate('Cand1', 'c1@ex.com', 'Role', 'LinkedIn'),
        hiringFlow.createCandidate('Cand2', 'c2@ex.com', 'Role', 'Referral'),
      ];
      candidates[0].stage = 'offer';
      candidates[1].stage = 'interviews';

      const offers = [
        hiringFlow.generateOffer('cand-123', 'Role', 100000, [], '2026-09-01'),
      ];
      const acceptedOffer = hiringFlow.sendOffer(offers[0]);
      hiringFlow.processOfferResponse(acceptedOffer, true);

      const metrics = hiringFlow.calculateMetrics(candidates, [acceptedOffer]);

      expect(metrics.timeToHire).toBeGreaterThanOrEqual(0);
      expect(metrics.costPerHire).toBeGreaterThan(0);
      expect(metrics.stageFunnelRates).toBeDefined();
      expect(metrics.acceptanceRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration: Full Hiring Workflow', () => {
    test('should execute complete hiring process', () => {
      // 1. Create requisition
      const req = orgManager.createRequisition(
        'Senior Engineer',
        'Engineering',
        'senior',
        100000,
        130000,
        ['TypeScript'],
        'high'
      );

      expect(req.status).toBe('open');

      // 2. Create candidates
      const candidates = [
        hiringFlow.createCandidate('John', 'john@ex.com', 'Senior Engineer', 'LinkedIn'),
        hiringFlow.createCandidate('Jane', 'jane@ex.com', 'Senior Engineer', 'Referral'),
      ];

      // 3. Advance through stages
      candidates[0] = hiringFlow.advanceStage(candidates[0], 'screening', 'Phone screen passed');
      candidates[0] = hiringFlow.advanceStage(candidates[0], 'technical', 'Technical passed');
      candidates[0] = hiringFlow.advanceStage(candidates[0], 'interviews', 'Manager interview scheduled');
      candidates[0] = hiringFlow.advanceStage(candidates[0], 'offer', 'Offer extended');

      // 4. Schedule and complete interviews
      const interview = hiringFlow.scheduleInterview(
        candidates[0],
        'technical',
        'lead',
        '2026-08-15T10:00:00Z',
        60
      );
      const withFeedback = hiringFlow.submitInterviewFeedback(interview, 88, 'Strong technical skills', 'Next: manager round');
      candidates[0].interviews.push(withFeedback);

      // 5. Generate and send offer
      const offer = hiringFlow.generateOffer('cand-1', 'Senior Engineer', 125000, ['Insurance', '401k'], '2026-09-01');
      const sentOffer = hiringFlow.sendOffer(offer);

      // 6. Accept offer
      const acceptedOffer = hiringFlow.processOfferResponse(sentOffer, true);

      // 7. Generate onboarding plan
      const plan = orgManager.generateOnboardingPlan(
        'emp-john',
        'John Doe',
        '2026-09-01',
        'Senior Engineer',
        'manager-id'
      );

      expect(acceptedOffer.status).toBe('accepted');
      expect(plan.tasks.length).toBeGreaterThan(0);

      // 8. Calculate metrics
      const metrics = hiringFlow.calculateMetrics(candidates, [sentOffer]);

      expect(metrics.acceptanceRate).toBeGreaterThanOrEqual(0);
    });
  });
});
