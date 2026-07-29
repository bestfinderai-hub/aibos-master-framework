/**
 * Workflow Templates
 * Pre-built automation workflows
 */

class WorkflowTemplates {
  static getTemplates() {
    return {
      welcome_sequence: this.getWelcomeSequence(),
      lead_nurture: this.getLeadNurture(),
      onboarding: this.getOnboarding(),
      churn_prevention: this.getChurnPrevention(),
      upsell_automation: this.getUpsellAutomation(),
      support_escalation: this.getSupportEscalation()
    };
  }

  static getWelcomeSequence() {
    return {
      name: 'Welcome Email Sequence',
      description: 'Send 3 welcome emails over 2 weeks',
      trigger: {
        type: 'event',
        event: 'contact_created'
      },
      actions: [
        {
          id: 'email_1',
          type: 'send_email',
          delay: 0,
          template: 'welcome_email_1',
          subject: 'Welcome to {{company}}!'
        },
        {
          id: 'email_2',
          type: 'send_email',
          delay: 86400 * 3, // 3 days
          template: 'welcome_email_2',
          subject: 'Getting started with {{product}}'
        },
        {
          id: 'email_3',
          type: 'send_email',
          delay: 86400 * 7, // 7 days
          template: 'welcome_email_3',
          subject: 'Your {{product}} tips & tricks'
        }
      ]
    };
  }

  static getLeadNurture() {
    return {
      name: 'Lead Nurture (BANT)',
      description: 'Qualify leads using BANT framework',
      trigger: {
        type: 'event',
        event: 'deal_created'
      },
      actions: [
        {
          id: 'send_bant_email',
          type: 'send_email',
          template: 'bant_qualification',
          subject: 'Let\\'s discuss your needs'
        },
        {
          id: 'create_task',
          type: 'create_task',
          title: 'Qualify lead using BANT',
          dueDate: '+3d'
        },
        {
          id: 'slack_notification',
          type: 'webhook',
          url: 'https://hooks.slack.com/...',
          payload: { channel: '#sales', message: 'New lead: {{firstName}}' }
        }
      ]
    };
  }

  static getOnboarding() {
    return {
      name: 'Customer Onboarding (30 days)',
      description: 'Automated 30-day onboarding journey',
      trigger: {
        type: 'event',
        event: 'contract_signed'
      },
      actions: [
        {
          id: 'day_1_email',
          type: 'send_email',
          delay: 0,
          template: 'onboarding_day1',
          subject: 'Welcome! Let\\'s get started'
        },
        {
          id: 'day_1_task',
          type: 'create_task',
          title: 'Schedule kickoff meeting',
          dueDate: '+1d'
        },
        {
          id: 'day_7_check_in',
          type: 'send_email',
          delay: 86400 * 7,
          template: 'onboarding_week1_checkin',
          subject: 'Week 1 check-in'
        },
        {
          id: 'day_30_review',
          type: 'send_email',
          delay: 86400 * 30,
          template: 'onboarding_month1_review',
          subject: '30-day onboarding review'
        }
      ]
    };
  }

  static getChurnPrevention() {
    return {
      name: 'Churn Prevention Alert',
      description: 'Alert when customer health score drops',
      trigger: {
        type: 'condition',
        condition: {
          field: 'health_score',
          operator: 'less_than',
          value: 50
        }
      },
      actions: [
        {
          id: 'create_urgent_task',
          type: 'create_task',
          title: 'URGENT: Customer at risk - {{companyName}}',
          priority: 'high',
          assignee: 'csm_team'
        },
        {
          id: 'slack_alert',
          type: 'webhook',
          url: 'https://hooks.slack.com/...',
          payload: { channel: '#customer-success', message: 'ALERT: {{companyName}} health at risk' }
        },
        {
          id: 'send_checkin_email',
          type: 'send_email',
          template: 'health_check_in',
          subject: 'We want to help - How can we improve?'
        }
      ]
    };
  }

  static getUpsellAutomation() {
    return {
      name: 'Upsell Opportunity Detection',
      description: 'Identify and notify about upsell opportunities',
      trigger: {
        type: 'condition',
        condition: {
          field: 'feature_adoption',
          operator: 'greater_than',
          value: 80
        }
      },
      actions: [
        {
          id: 'identify_upsell',
          type: 'update_field',
          entity: 'deal',
          field: 'stage',
          value: 'expansion_ready'
        },
        {
          id: 'notify_sales',
          type: 'send_email',
          to: '{{account_manager_email}}',
          template: 'upsell_opportunity',
          subject: 'Upsell opportunity: {{companyName}}'
        },
        {
          id: 'create_deal',
          type: 'create_task',
          title: 'Follow up on expansion with {{companyName}}',
          dueDate: '+5d'
        }
      ]
    };
  }

  static getSupportEscalation() {
    return {
      name: 'Support Ticket Escalation',
      description: 'Route urgent tickets to appropriate team',
      trigger: {
        type: 'event',
        event: 'support_ticket_created'
      },
      actions: [
        {
          id: 'check_priority',
          type: 'condition',
          condition: {
            field: 'priority',
            operator: 'equals',
            value: 'urgent'
          }
        },
        {
          id: 'route_to_vip',
          type: 'create_task',
          title: 'URGENT SUPPORT: {{ticketId}}',
          assignee: 'vip_support_team',
          priority: 'high'
        },
        {
          id: 'notify_on_call',
          type: 'send_sms',
          to: '{{on_call_engineer_phone}}',
          message: 'URGENT: {{customerName}} support ticket requires immediate attention'
        }
      ]
    };
  }
}

module.exports = WorkflowTemplates;
