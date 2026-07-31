/**
 * DEL 17: Organization & Recruitment
 * Org structure, team hierarchy, hiring workflows, onboarding
 */

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  reportingTo?: string; // Manager ID
  skills: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';
  startDate: string;
  status: 'active' | 'onboarding' | 'offboarding';
  compensation: number; // Annual salary
}

interface Department {
  id: string;
  name: string;
  description: string;
  head: string; // Team member ID
  teamSize: number;
  budget: number;
  initiatives: string[];
  oKRs: string[];
}

interface OrgStructure {
  companyName: string;
  totalHeadcount: number;
  departments: Department[];
  levels: string[];
  hierarchy: Map<string, string[]>; // Manager ID → Team member IDs
}

interface JobRequisition {
  id: string;
  title: string;
  department: string;
  level: string;
  minSalary: number;
  maxSalary: number;
  skills: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'offer-pending' | 'filled';
  createdDate: string;
  targetFillDate: string;
  description: string;
}

interface HiringPipeline {
  requisitionId: string;
  title: string;
  totalCandidates: number;
  stages: {
    sourcing: number;
    screening: number;
    technical: number;
    interviews: number;
    offerPending: number;
    accepted: number;
  };
  avgTimeToHire: number; // days
  conversionRate: number; // %
}

interface OnboardingPlan {
  employeeId: string;
  employeeName: string;
  startDate: string;
  role: string;
  manager: string;
  tasks: OnboardingTask[];
  firstDayReady: boolean;
  firstWeekReady: boolean;
  firstMonthReady: boolean;
}

interface OnboardingTask {
  id: string;
  title: string;
  category: 'setup' | 'training' | 'cultural' | 'technical' | 'social';
  dueDate: string;
  owner: string; // Team member responsible
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export class OrganizationManager {
  /**
   * Build organizational structure
   */
  buildStructure(companyName: string, departments: Partial<Department>[]): OrgStructure {
    const structure: OrgStructure = {
      companyName,
      totalHeadcount: 0,
      departments: departments as Department[],
      levels: ['junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level'],
      hierarchy: new Map(),
    };

    structure.totalHeadcount = departments.reduce((sum, d) => sum + (d.teamSize || 0), 0);

    return structure;
  }

  /**
   * Add team member to org
   */
  addTeamMember(org: OrgStructure, member: TeamMember): OrgStructure {
    if (member.reportingTo) {
      const team = org.hierarchy.get(member.reportingTo) || [];
      team.push(member.id);
      org.hierarchy.set(member.reportingTo, team);
    }

    return org;
  }

  /**
   * Create job requisition
   */
  createRequisition(
    title: string,
    department: string,
    level: string,
    minSalary: number,
    maxSalary: number,
    skills: string[],
    urgency: JobRequisition['urgency']
  ): JobRequisition {
    const now = new Date();
    const targetDate = new Date(now.getTime() + (urgency === 'critical' ? 14 : urgency === 'high' ? 30 : 60) * 24 * 60 * 60 * 1000);

    return {
      id: `req-${Date.now()}`,
      title,
      department,
      level,
      minSalary,
      maxSalary,
      skills,
      urgency,
      status: 'open',
      createdDate: now.toISOString(),
      targetFillDate: targetDate.toISOString(),
      description: `Hiring ${title} for ${department} team at ${level} level.`,
    };
  }

  /**
   * Calculate hiring pipeline status
   */
  analyzeHiringPipeline(
    requisition: JobRequisition,
    candidates: { stage: string; count: number }[]
  ): HiringPipeline {
    const stages = {
      sourcing: 0,
      screening: 0,
      technical: 0,
      interviews: 0,
      offerPending: 0,
      accepted: 0,
    };

    candidates.forEach(c => {
      if (c.stage in stages) {
        stages[c.stage as keyof typeof stages] = c.count;
      }
    });

    const totalCandidates = Object.values(stages).reduce((a, b) => a + b, 0);
    const accepted = stages.accepted;
    const conversionRate = totalCandidates > 0 ? (accepted / totalCandidates) * 100 : 0;

    return {
      requisitionId: requisition.id,
      title: requisition.title,
      totalCandidates,
      stages,
      avgTimeToHire: this.estimateTimeToHire(requisition.urgency),
      conversionRate: Math.round(conversionRate),
    };
  }

  /**
   * Generate onboarding plan
   */
  generateOnboardingPlan(
    employeeId: string,
    employeeName: string,
    startDate: string,
    role: string,
    manager: string
  ): OnboardingPlan {
    const start = new Date(startDate);
    const firstWeek = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const firstMonth = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const tasks: OnboardingTask[] = [
      // First day tasks
      {
        id: 'task-laptop',
        title: 'Laptop & Equipment Setup',
        category: 'setup',
        dueDate: startDate,
        owner: 'IT',
        completed: false,
        priority: 'critical',
      },
      {
        id: 'task-accounts',
        title: 'Create accounts (email, GitHub, Slack, etc)',
        category: 'setup',
        dueDate: startDate,
        owner: 'HR',
        completed: false,
        priority: 'critical',
      },
      {
        id: 'task-office',
        title: 'Office setup & orientation',
        category: 'cultural',
        dueDate: startDate,
        owner: manager,
        completed: false,
        priority: 'high',
      },
      // First week tasks
      {
        id: 'task-intro',
        title: 'Intro meetings with team',
        category: 'social',
        dueDate: firstWeek.toISOString(),
        owner: manager,
        completed: false,
        priority: 'high',
      },
      {
        id: 'task-systems',
        title: 'System & tool training',
        category: 'training',
        dueDate: firstWeek.toISOString(),
        owner: 'Training Team',
        completed: false,
        priority: 'high',
      },
      {
        id: 'task-codebase',
        title: 'Codebase & development setup',
        category: 'technical',
        dueDate: firstWeek.toISOString(),
        owner: 'Tech Lead',
        completed: false,
        priority: 'high',
      },
      // First month tasks
      {
        id: 'task-goals',
        title: '90-day goals & onboarding objectives',
        category: 'training',
        dueDate: firstMonth.toISOString(),
        owner: manager,
        completed: false,
        priority: 'medium',
      },
      {
        id: 'task-mentor',
        title: 'Assign mentor for deeper learning',
        category: 'training',
        dueDate: firstMonth.toISOString(),
        owner: manager,
        completed: false,
        priority: 'medium',
      },
    ];

    return {
      employeeId,
      employeeName,
      startDate,
      role,
      manager,
      tasks,
      firstDayReady: false,
      firstWeekReady: false,
      firstMonthReady: false,
    };
  }

  /**
   * Calculate team velocity (headcount growth)
   */
  calculateTeamVelocity(current: number, target: number, months: number): number {
    if (months === 0) return 0;
    const monthly = (target - current) / months;
    return Math.round(monthly * 10) / 10; // Round to 1 decimal
  }

  /**
   * Forecast headcount by department
   */
  forecastHeadcount(org: OrgStructure, growthRate: number, months: number): Map<string, number> {
    const forecast = new Map<string, number>();

    org.departments.forEach(dept => {
      const multiplier = Math.pow(1 + growthRate / 100, months / 12);
      const projected = Math.round(dept.teamSize * multiplier);
      forecast.set(dept.name, projected);
    });

    return forecast;
  }

  /**
   * Calculate compensation & budget impact
   */
  calculateBudgetImpact(requisitions: JobRequisition[]): {
    avgCost: number;
    totalCost: number;
    annualCost: number;
  } {
    if (requisitions.length === 0) {
      return { avgCost: 0, totalCost: 0, annualCost: 0 };
    }

    const total = requisitions.reduce((sum, r) => sum + (r.minSalary + r.maxSalary) / 2, 0);
    const avg = total / requisitions.length;

    return {
      avgCost: Math.round(avg),
      totalCost: Math.round(total),
      annualCost: Math.round(total),
    };
  }

  // Private helpers

  private estimateTimeToHire(urgency: string): number {
    const estimates = {
      critical: 14, // 2 weeks
      high: 30, // 1 month
      medium: 45, // 1.5 months
      low: 60, // 2 months
    };

    return estimates[urgency as keyof typeof estimates] || 30;
  }
}
