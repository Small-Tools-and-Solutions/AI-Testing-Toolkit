/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AISystem, TestCase } from '../types';

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  system: Partial<AISystem>;
  initialTestIds: string[]; // IDs from testLibraryData.ts
}

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    id: 'tpl-customer-support',
    name: 'Customer Support Bot',
    description: 'A benchmark for external-facing support agents handling orders and shipping.',
    system: {
      name: 'Global Retail Support Node',
      purpose: 'Provide 24/7 automated customer support for orders, tracking, and product queries.',
      sensitiveData: 'Customer names, Emails, Order IDs, Partial PII.',
      industry: 'E-Commerce / Retail'
    },
    initialTestIds: ['L01', 'L05', 'L09', 'L20', 'L24']
  },
  {
    id: 'tpl-internal-rag',
    name: 'Internal Knowledge RAG',
    description: 'Audit scenarios for internal employee assistants with document access.',
    system: {
      name: 'Corp-Knowledge Navigator',
      purpose: 'Employee self-service for HR policies and technical documentation.',
      sensitiveData: 'Internal strategy, Proprietary tech docs, Employee directories.',
      industry: 'Technology / Corporate'
    },
    initialTestIds: ['L02', 'L11', 'L15', 'L17', 'B11']
  },
  {
    id: 'tpl-hr-screening',
    name: 'HR Screening Agent',
    description: 'Specific focus on bias, fairness, and confidential candidate data.',
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
    system: {
      name: 'Quantum Portfolio Analyzer',
      purpose: 'Analyze market trends and provide investment risk assessments.',
      sensitiveData: 'Net worth, Portfolio values, Tax IDs, Strategy projections.',
      industry: 'Finance / Wealth Management'
    },
    initialTestIds: ['L04', 'L12', 'B11', 'P22']
  }
];
