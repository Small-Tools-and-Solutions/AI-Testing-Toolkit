/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AISystem, TestCase } from '../types';

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  system: Partial<AISystem>;
  initialTestIds: string[]; // IDs from testLibraryData.ts
}

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    id: 'tpl-global-audit',
    name: 'Global Security Audit',
    description: 'Comprehensive assessment using ALL available security probes and baseline tests.',
    icon: 'ShieldCheck',
    system: {
      name: 'Omni-Neural Sentinel',
      purpose: 'General purpose enterprise AI agent with broad tool access and knowledge base integration.',
      sensitiveData: 'PII, internal secrets, proprietary code, financial records, HR complaints.',
      industry: 'Cross-Industry / Enterprise'
    },
    initialTestIds: ['L01', 'L02', 'L03', 'L04', 'L05', 'L07', 'L08', 'W01', 'W02', 'W03', 'L11', 'L14', 'L16', 'L17', 'L18', 'P19', 'P20', 'P21', 'L24', 'L25', 'P22', 'P23', 'B09', 'B10', 'B11', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08']
  },
  {
    id: 'tpl-blank',
    name: 'Blank Template',
    description: 'A clean slate for custom assessment configuration. All fields will be empty.',
    icon: 'File',
    system: {
      name: 'NEW AI SYSTEM',
      purpose: '',
      sensitiveData: '',
      industry: 'Custom'
    },
    initialTestIds: []
  },
  {
    id: 'tpl-red-team',
    name: 'Red Team Adversarial',
    description: 'Focus on multi-step jailbreaking, advanced prompt injection, and social engineering.',
    icon: 'Zap',
    system: {
      name: 'Adversary Simulation Node',
      purpose: 'Simulate sophisticated attacks to test model robustness and guardrail efficacy.',
      sensitiveData: 'System prompts, internal routing logic, safety filters.',
      industry: 'Cybersecurity / Research'
    },
    initialTestIds: ['L01', 'L03', 'L05', 'L07', 'L11', 'B01', 'B02', 'B08']
  },
  {
    id: 'tpl-customer-support',
    name: 'Customer Support Bot',
    description: 'A benchmark for external-facing support agents handling orders and shipping.',
    icon: 'MessageSquare',
    system: {
      name: 'Global Retail Support Node',
      purpose: 'Provide 24/7 automated customer support for orders, tracking, and product queries.',
      sensitiveData: 'Customer names, Emails, Order IDs, Partial PII.',
      industry: 'E-Commerce / Retail'
    },
    initialTestIds: ['L01', 'L05', 'L07', 'L08', 'L24']
  },
  {
    id: 'tpl-internal-rag',
    name: 'Internal Knowledge RAG',
    description: 'Audit scenarios for internal employee assistants with document access.',
    icon: 'BookOpen',
    system: {
      name: 'Corp-Knowledge Navigator',
      purpose: 'Employee self-service for HR policies and technical documentation.',
      sensitiveData: 'Internal strategy, Proprietary tech docs, Employee directories.',
      industry: 'Technology / Corporate'
    },
    initialTestIds: ['L02', 'L11', 'L16', 'L17', 'B11']
  },
  {
    id: 'tpl-hr-screening',
    name: 'HR Screening Agent',
    description: 'Specific focus on bias, fairness, and confidential candidate data.',
    icon: 'Users',
    system: {
      name: 'Talent Acquisition Shield',
      purpose: 'Automate initial resume screening and candidate interview scheduling.',
      sensitiveData: 'Candidate PII, Performance reviews, Salary expectations.',
      industry: 'Human Resources'
    },
    initialTestIds: ['B09', 'L25', 'B10']
  },
  {
    id: 'tpl-financial-analyst',
    name: 'Financial Audit Assistant',
    description: 'Scenarios for handling sensitive market data and portfolio information.',
    icon: 'Landmark',
    system: {
      name: 'Quantum Portfolio Analyzer',
      purpose: 'Analyze market trends and provide investment risk assessments.',
      sensitiveData: 'Net worth, Portfolio values, Tax IDs, Strategy projections.',
      industry: 'Finance / Wealth Management'
    },
    initialTestIds: ['L04', 'B11', 'P22', 'W01']
  },
  {
    id: 'tpl-healthcare',
    name: 'Healthcare Compliance',
    description: 'Focus on PHI protection, medical data handling, and regulatory compliance.',
    icon: 'Heart',
    system: {
      name: 'Med-Link Assistant',
      purpose: 'Summarize patient records and provide drug interaction information.',
      sensitiveData: 'Patient PII, clinical notes, treatment plans, medical history.',
      industry: 'Healthcare'
    },
    initialTestIds: ['L02', 'L18', 'L25', 'B11']
  },
  {
    id: 'tpl-legal-ip',
    name: 'Legal & Intellectual Property',
    description: 'Audit for leaks of patent applications, proprietary algorithms, and legal advice.',
    icon: 'Gavel',
    system: {
      name: 'Lex-Intellect-Guard',
      purpose: 'Assist legal teams with case research and patent documentation review.',
      sensitiveData: 'Pending patents, attorney-client privileged notes, trade secrets.',
      industry: 'Legal / IP'
    },
    initialTestIds: ['L02', 'L16', 'B11', 'W02']
  }
];
