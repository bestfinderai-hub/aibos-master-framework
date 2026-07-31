/**
 * Agent Factory
 * Dynamically create agents and skills based on project needs
 */

class AgentFactory {
  constructor() {
    this.agents = new Map();
    this.skills = new Map();
    this.templates = this.loadTemplates();
  }

  // ============================================================================
  // CREATE AGENTS FROM NEEDS
  // ============================================================================

  createAgentFromNeeds(needs) {
    const agentConfig = {
      id: `agent-${Date.now()}`,
      name: needs.name,
      purpose: needs.purpose,
      description: needs.description,
      capabilities: this.generateCapabilities(needs),
      skills: this.selectSkills(needs),
      tools: this.selectTools(needs),
      constraints: needs.constraints || [],
      autonomyLevel: needs.autonomyLevel || 'supervised', // supervised, semi-autonomous, autonomous
      interactionStyle: needs.interactionStyle || 'collaborative',
      knowledgeBases: needs.knowledgeBases || [],
      integrations: this.selectIntegrations(needs),
      successMetrics: this.defineSuccessMetrics(needs),
      createdAt: new Date()
    };

    this.agents.set(agentConfig.id, agentConfig);
    return agentConfig;
  }

  generateCapabilities(needs) {
    const capabilities = [];

    if (needs.needsAnalysis) capabilities.push('Data Analysis');
    if (needs.needsResearch) capabilities.push('Research & Investigation');
    if (needs.needsDecisionMaking) capabilities.push('Decision Making');
    if (needs.needsContent) capabilities.push('Content Generation');
    if (needs.needsAutomation) capabilities.push('Process Automation');
    if (needs.needsIntegration) capabilities.push('System Integration');
    if (needs.needsMonitoring) capabilities.push('Monitoring & Alerts');
    if (needs.needsOptimization) capabilities.push('Optimization');
    if (needs.needsCompliance) capabilities.push('Compliance Check');
    if (needs.needsQualityReview) capabilities.push('Quality Review');

    return capabilities;
  }

  selectSkills(needs) {
    const selectedSkills = [];

    // Analysis skills
    if (needs.needsAnalysis) {
      selectedSkills.push('data-analysis', 'statistical-analysis', 'trend-detection');
    }

    // Research skills
    if (needs.needsResearch) {
      selectedSkills.push('web-research', 'competitive-analysis', 'market-research');
    }

    // Content skills
    if (needs.needsContent) {
      selectedSkills.push('writing', 'copywriting', 'content-optimization');
    }

    // Automation skills
    if (needs.needsAutomation) {
      selectedSkills.push('workflow-automation', 'task-scheduling', 'error-recovery');
    }

    // Quality skills
    if (needs.needsQualityReview) {
      selectedSkills.push('code-review', 'quality-assurance', 'testing');
    }

    return [...new Set(selectedSkills)];
  }

  selectTools(needs) {
    const tools = [];

    if (needs.needsAnalysis) tools.push('analytics-engine', 'data-processor');
    if (needs.needsResearch) tools.push('search-engine', 'web-scraper', 'api-client');
    if (needs.needsContent) tools.push('nlp-engine', 'template-engine');
    if (needs.needsAutomation) tools.push('workflow-engine', 'scheduler');
    if (needs.needsIntegration) tools.push('api-connector', 'webhook-handler');
    if (needs.needsMonitoring) tools.push('monitoring-dashboard', 'alert-system');
    if (needs.needsCompliance) tools.push('compliance-checker', 'audit-logger');

    return [...new Set(tools)];
  }

  selectIntegrations(needs) {
    const integrations = [];

    if (needs.integrateSalesforce) integrations.push('salesforce');
    if (needs.integrateHubSpot) integrations.push('hubspot');
    if (needs.integrateSlack) integrations.push('slack');
    if (needs.integrateGoogle) integrations.push('google-workspace');
    if (needs.integrateTwilio) integrations.push('twilio');
    if (needs.integrateStripe) integrations.push('stripe');
    if (needs.integrateGithub) integrations.push('github');

    return integrations;
  }

  defineSuccessMetrics(needs) {
    const metrics = {};

    if (needs.needsAnalysis) {
      metrics.accuracy = '95%+';
      metrics.speed = '<2s per analysis';
    }

    if (needs.needsResearch) {
      metrics.completeness = '90%+ coverage';
      metrics.relevance = '85%+ relevant results';
    }

    if (needs.needsContent) {
      metrics.quality = '8/10+ rating';
      metrics.speed = '5+ pieces/day';
    }

    if (needs.needsAutomation) {
      metrics.efficiency = '50%+ time saved';
      metrics.reliability = '99.5%+ uptime';
    }

    if (needs.needsQualityReview) {
      metrics.defectDetection = '90%+ issues found';
      metrics.falsePositive = '<5%';
    }

    return metrics;
  }

  // ============================================================================
  // CREATE SKILLS FROM NEEDS
  // ============================================================================

  createSkillFromNeeds(needs) {
    const skillConfig = {
      id: `skill-${Date.now()}`,
      name: needs.name,
      purpose: needs.purpose,
      description: needs.description,
      category: needs.category || 'custom',
      actions: this.defineSkillActions(needs),
      inputs: needs.inputs || [],
      outputs: needs.outputs || [],
      dependencies: needs.dependencies || [],
      requirements: this.defineRequirements(needs),
      performanceMetrics: this.definePerformanceMetrics(needs),
      version: '1.0.0',
      createdAt: new Date()
    };

    this.skills.set(skillConfig.id, skillConfig);
    return skillConfig;
  }

  defineSkillActions(needs) {
    const actions = [];

    if (needs.canAnalyze) {
      actions.push({
        name: 'analyze',
        description: `Analyze ${needs.dataType || 'data'}`,
        inputs: ['data', 'parameters'],
        outputs: ['results', 'insights']
      });
    }

    if (needs.canGenerateReport) {
      actions.push({
        name: 'generate-report',
        description: `Generate ${needs.reportType || 'report'}`,
        inputs: ['data', 'format'],
        outputs: ['report']
      });
    }

    if (needs.canOptimize) {
      actions.push({
        name: 'optimize',
        description: `Optimize ${needs.optimizeTarget || 'system'}`,
        inputs: ['metrics', 'constraints'],
        outputs: ['optimized-config', 'improvement']
      });
    }

    if (needs.canMonitor) {
      actions.push({
        name: 'monitor',
        description: `Monitor ${needs.monitorTarget || 'system'}`,
        inputs: ['threshold', 'interval'],
        outputs: ['status', 'alerts']
      });
    }

    return actions;
  }

  defineRequirements(needs) {
    return {
      minDataPoints: needs.minDataPoints || 10,
      minAccuracy: needs.minAccuracy || 80,
      maxLatency: needs.maxLatency || 5000, // ms
      dataFormats: needs.dataFormats || ['json', 'csv'],
      computeResources: needs.computeResources || 'standard',
      securityLevel: needs.securityLevel || 'standard'
    };
  }

  definePerformanceMetrics(needs) {
    return {
      avgProcessingTime: needs.avgProcessingTime || '< 1s',
      throughput: needs.throughput || '1000+ ops/min',
      accuracy: needs.accuracy || '> 90%',
      reliability: needs.reliability || '> 99%',
      scalability: needs.scalability || 'linear'
    };
  }

  // ============================================================================
  // TEMPLATES & PRESETS
  // ============================================================================

  loadTemplates() {
    return {
      researcher: {
        purpose: 'Conduct in-depth research',
        capabilities: ['Research & Investigation', 'Data Analysis'],
        skills: ['web-research', 'data-analysis', 'competitive-analysis'],
        autonomyLevel: 'semi-autonomous'
      },

      analyst: {
        purpose: 'Analyze data and generate insights',
        capabilities: ['Data Analysis', 'Reporting'],
        skills: ['data-analysis', 'statistical-analysis', 'visualization'],
        autonomyLevel: 'supervised'
      },

      developer: {
        purpose: 'Assist with development tasks',
        capabilities: ['Code Generation', 'Quality Review', 'Testing'],
        skills: ['code-review', 'testing', 'optimization'],
        autonomyLevel: 'semi-autonomous'
      },

      manager: {
        purpose: 'Project and task management',
        capabilities: ['Decision Making', 'Process Automation', 'Monitoring'],
        skills: ['task-scheduling', 'priority-management', 'status-reporting'],
        autonomyLevel: 'supervised'
      },

      customer_success: {
        purpose: 'Customer support and success',
        capabilities: ['Analysis', 'Automation', 'Content Generation'],
        skills: ['customer-analysis', 'workflow-automation', 'communication'],
        autonomyLevel: 'semi-autonomous'
      },

      controller: {
        purpose: 'Quality assurance and compliance review',
        capabilities: ['Quality Review', 'Compliance Check', 'Analysis'],
        skills: ['quality-assurance', 'compliance-check', 'audit-logging'],
        autonomyLevel: 'supervised'
      }
    };
  }

  createAgentFromTemplate(templateName, customizations = {}) {
    const template = this.templates[templateName];
    if (!template) throw new Error(`Template ${templateName} not found`);

    const agentConfig = {
      id: `agent-${Date.now()}`,
      name: customizations.name || templateName,
      purpose: customizations.purpose || template.purpose,
      description: customizations.description || `Agent based on ${templateName} template`,
      capabilities: customizations.capabilities || template.capabilities,
      skills: customizations.skills || template.skills,
      tools: customizations.tools || [],
      autonomyLevel: customizations.autonomyLevel || template.autonomyLevel,
      interactionStyle: customizations.interactionStyle || 'collaborative',
      integrations: customizations.integrations || [],
      successMetrics: customizations.successMetrics || {},
      createdAt: new Date()
    };

    this.agents.set(agentConfig.id, agentConfig);
    return agentConfig;
  }

  // ============================================================================
  // AGENT & SKILL MANAGEMENT
  // ============================================================================

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  listAgents() {
    return Array.from(this.agents.values());
  }

  listSkills() {
    return Array.from(this.skills.values());
  }

  updateAgent(agentId, updates) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const updated = { ...agent, ...updates, updatedAt: new Date() };
    this.agents.set(agentId, updated);
    return updated;
  }

  deleteAgent(agentId) {
    return this.agents.delete(agentId);
  }

  deleteSkill(skillId) {
    return this.skills.delete(skillId);
  }

  // ============================================================================
  // VALIDATION & OPTIMIZATION
  // ============================================================================

  validateAgentConfig(agentConfig) {
    const issues = [];

    if (!agentConfig.name) issues.push('Agent name is required');
    if (!agentConfig.purpose) issues.push('Agent purpose is required');
    if (!agentConfig.skills || agentConfig.skills.length === 0) issues.push('At least one skill is required');
    if (!agentConfig.capabilities || agentConfig.capabilities.length === 0) issues.push('At least one capability is required');

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  validateSkillConfig(skillConfig) {
    const issues = [];

    if (!skillConfig.name) issues.push('Skill name is required');
    if (!skillConfig.purpose) issues.push('Skill purpose is required');
    if (!skillConfig.actions || skillConfig.actions.length === 0) issues.push('At least one action is required');

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  recommendAgents(projectNeeds) {
    const recommendations = [];

    if (projectNeeds.hasDataAnalytics) {
      recommendations.push({
        name: 'Data Analyst',
        template: 'analyst',
        justification: 'Project requires data analysis capabilities'
      });
    }

    if (projectNeeds.hasResearch) {
      recommendations.push({
        name: 'Research Agent',
        template: 'researcher',
        justification: 'Project requires research and investigation capabilities'
      });
    }

    if (projectNeeds.hasQualityControl) {
      recommendations.push({
        name: 'Quality Controller',
        template: 'controller',
        justification: 'Project requires quality assurance and compliance review'
      });
    }

    if (projectNeeds.hasCustomerSupport) {
      recommendations.push({
        name: 'Customer Success Agent',
        template: 'customer_success',
        justification: 'Project requires customer support capabilities'
      });
    }

    return recommendations;
  }

  exportAgentConfiguration(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    return {
      agent,
      skills: agent.skills.map(skillId => this.skills.get(skillId)),
      exportedAt: new Date()
    };
  }
}

module.exports = AgentFactory;
