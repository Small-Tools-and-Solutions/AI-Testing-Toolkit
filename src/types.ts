/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AISystem {
  id: string;
  name: string;
  purpose: string;
  targetUsers: string;
  dataSources: string;
  connectedTools: string;
  allowedActions: string;
  mustRefuse: string;
  sensitiveData: string;
  industry: string;
  knownRisks: string;
}

export type TestPackStatus = 'RED' | 'AMBER' | 'GREEN';

export interface TestPack {
  id: string;
  systemId: string;
  status: TestPackStatus;
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
  templateId?: string;
  caseCounts?: {
    total: number;
    pass: number;
    fail: number;
    notTested: number;
  };
}

export type TestCaseResult = 'PASS' | 'FAIL' | 'NOT TESTED';

export interface TestCase {
  id: string;
  testPackId: string;
  libraryId?: string;
  category: string;
  prompt: string;
  expectedBehaviour: string;
  actualResponse: string;
  result: TestCaseResult;
  riskArea: string;
  priority: string;
  notes: string;
  hint?: string;
  tags?: string[];
  testedAt?: string;
}

export interface LibraryTest {
  id: string;
  category: string;
  owaspArea: string;
  prompt: string;
  expected: string;
  whenToUse: string;
  tags?: string[];
  hint?: string;
}

export interface DashboardStats {
  totalTests: number;
  completedTests: number;
  passCount: number;
  failCount: number;
  completionPercentage: number;
  overallStatus: TestPackStatus;
}
