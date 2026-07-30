/**
 * Constitution Tests
 */

const AIBOSConstitution = require('../constitution');

describe('AIBOSConstitution', () => {
  let constitution;

  beforeEach(() => {
    constitution = new AIBOSConstitution();
  });

  describe('core values', () => {
    test('should define core values', () => {
      const values = constitution.values;

      expect(values.excellence).toBeTruthy();
      expect(values.transparency).toBeTruthy();
      expect(values.integrity).toBeTruthy();
      expect(values.innovation).toBeTruthy();
      expect(values.sustainability).toBeTruthy();
    });

    test('should have value commitments', () => {
      const excellenceCommitments = constitution.getValueCommitments('excellence');

      expect(excellenceCommitments.length).toBeGreaterThan(0);
      expect(excellenceCommitments).toContain('Maintain 85%+ test coverage');
    });

    test('should have value principles', () => {
      const excellenceValue = constitution.values.excellence;

      expect(excellenceValue.principles.length).toBeGreaterThan(0);
      expect(excellenceValue.description).toBeTruthy();
    });
  });

  describe('first principles', () => {
    test('should define first principles', () => {
      const principles = constitution.principles;

      expect(principles.human_centric).toBeTruthy();
      expect(principles.data_sovereignty).toBeTruthy();
      expect(principles.algorithmic_fairness).toBeTruthy();
      expect(principles.security_first).toBeTruthy();
      expect(principles.open_standards).toBeTruthy();
      expect(principles.continuous_learning).toBeTruthy();
    });

    test('should have principle guidelines', () => {
      const dataGuidelines = constitution.getPrincipleGuidelines('data_sovereignty');

      expect(dataGuidelines.length).toBeGreaterThan(0);
      expect(dataGuidelines).toContain('User owns all their data');
    });
  });

  describe('governance model', () => {
    test('should define governance structure', () => {
      const governance = constitution.governance;

      expect(governance.structure).toBeTruthy();
      expect(governance.structure.executive).toBeTruthy();
      expect(governance.structure.leadership).toBeTruthy();
      expect(governance.structure.advisory).toBeTruthy();
    });

    test('should define decision-making process', () => {
      const decisions = constitution.governance.decision_making;

      expect(decisions.strategic).toBeTruthy();
      expect(decisions.tactical).toBeTruthy();
      expect(decisions.operational).toBeTruthy();
    });

    test('should define transparency requirements', () => {
      const transparency = constitution.governance.transparency;

      expect(transparency.public_roadmap).toBeTruthy();
      expect(transparency.decision_log).toBeTruthy();
      expect(transparency.financial_reports).toBeTruthy();
    });
  });

  describe('ethical guidelines', () => {
    test('should define AI ethics', () => {
      const ethics = constitution.ethics;

      expect(ethics.ai_ethics).toBeTruthy();
      expect(ethics.ai_ethics.bias_mitigation).toBeTruthy();
      expect(ethics.ai_ethics.transparency).toBeTruthy();
      expect(ethics.ai_ethics.human_autonomy).toBeTruthy();
    });

    test('should define data ethics', () => {
      const ethics = constitution.ethics;

      expect(ethics.data_ethics).toBeTruthy();
      expect(ethics.data_ethics.collection).toBeTruthy();
      expect(ethics.data_ethics.retention).toBeTruthy();
      expect(ethics.data_ethics.security).toBeTruthy();
    });

    test('should define business ethics', () => {
      const ethics = constitution.ethics;

      expect(ethics.business_ethics).toBeTruthy();
      expect(ethics.business_ethics.pricing).toBeTruthy();
      expect(ethics.business_ethics.competition).toBeTruthy();
      expect(ethics.business_ethics.stakeholders).toBeTruthy();
    });

    test('should get specific ethical guideline', () => {
      const guideline = constitution.getEthicalGuideline('data_ethics', 'security');

      expect(guideline).toBeTruthy();
      expect(guideline.encryption).toBeTruthy();
    });
  });

  describe('vision and mission', () => {
    test('should define mission', () => {
      const vision = constitution.vision;

      expect(vision.mission).toBeTruthy();
      expect(vision.mission.length).toBeGreaterThan(0);
    });

    test('should define vision', () => {
      const vision = constitution.vision;

      expect(vision.vision).toBeTruthy();
      expect(vision.vision.length).toBeGreaterThan(0);
    });

    test('should define impact areas', () => {
      const vision = constitution.vision;

      expect(vision.impact_areas).toBeTruthy();
      expect(vision.impact_areas.productivity).toBeTruthy();
      expect(vision.impact_areas.intelligence).toBeTruthy();
    });

    test('should define long-term goals', () => {
      const vision = constitution.vision;

      expect(vision.long_term_goals.year_1).toBeTruthy();
      expect(vision.long_term_goals.year_3).toBeTruthy();
      expect(vision.long_term_goals.year_10).toBeTruthy();
    });

    test('should define success metrics', () => {
      const vision = constitution.vision;

      expect(vision.success_metrics).toBeTruthy();
      expect(vision.success_metrics.user_adoption).toBeTruthy();
      expect(vision.success_metrics.customer_satisfaction).toBeTruthy();
    });
  });

  describe('constitution assessment', () => {
    test('should assess decision alignment with constitution', () => {
      const decision = {
        name: 'Open source commitment',
        involves_ai: false,
        involves_data: false,
        involves_pricing: false
      };

      const assessment = constitution.assessDecisionAgainstConstitution(decision);

      expect(assessment.decision).toBeTruthy();
      expect(assessment.aligns_with_values).toBeTruthy();
      expect(assessment.conflicts_with_values).toBeTruthy();
    });

    test('should flag AI ethics reviews', () => {
      const decision = {
        name: 'Deploy new ML model',
        involves_ai: true,
        involves_data: true
      };

      const assessment = constitution.assessDecisionAgainstConstitution(decision);

      expect(assessment.ethical_concerns).toContain('AI Ethics Review Required');
      expect(assessment.ethical_concerns).toContain('Data Ethics Review Required');
    });

    test('should flag pricing ethics reviews', () => {
      const decision = {
        name: 'Raise prices 30%',
        involves_pricing: true
      };

      const assessment = constitution.assessDecisionAgainstConstitution(decision);

      expect(assessment.ethical_concerns).toContain('Business Ethics Review Required');
    });
  });

  describe('utilities', () => {
    test('should export constitution summary', () => {
      const summary = constitution.getConstitutionSummary();

      expect(summary.mission).toBeTruthy();
      expect(summary.vision).toBeTruthy();
      expect(summary.core_values.length).toBe(5);
      expect(summary.first_principles.length).toBe(6);
    });

    test('should export full constitution', () => {
      const exported = constitution.exportConstitution();

      expect(exported.values).toBeTruthy();
      expect(exported.principles).toBeTruthy();
      expect(exported.governance).toBeTruthy();
      expect(exported.ethics).toBeTruthy();
      expect(exported.vision).toBeTruthy();
      expect(exported.exported_at).toBeTruthy();
    });
  });
});
