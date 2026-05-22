/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AISystem, TestPack, TestCase } from '../types';

interface MemoryStoreContextType {
  systems: AISystem[];
  testPacks: TestPack[];
  testCases: Record<string, TestCase[]>;
  updateSystem: (system: AISystem) => void;
  updatePack: (pack: TestPack) => void;
  updateCases: (packId: string, cases: TestCase[]) => void;
  deletePack: (packId: string) => void;
  getSystem: (id: string) => AISystem | undefined;
  getPack: (id: string) => TestPack | undefined;
  getCases: (packId: string) => TestCase[];
}

const MemoryStoreContext = createContext<MemoryStoreContextType | undefined>(undefined);

export function MemoryStoreProvider({ children }: { children: ReactNode }) {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [testPacks, setTestPacks] = useState<TestPack[]>([]);
  const [testCases, setTestCases] = useState<Record<string, TestCase[]>>({});

  const updateSystem = (system: AISystem) => {
    setSystems(prev => {
      const exists = prev.find(s => s.id === system.id);
      if (exists) return prev.map(s => s.id === system.id ? system : s);
      return [...prev, system];
    });
  };

  const updatePack = (pack: TestPack) => {
    setTestPacks(prev => {
      const exists = prev.find(p => p.id === pack.id);
      if (exists) return prev.map(p => p.id === pack.id ? pack : p);
      return [...prev, pack];
    });
  };

  const updateCases = (packId: string, cases: TestCase[]) => {
    setTestCases(prev => ({ ...prev, [packId]: cases }));
  };

  const deletePack = (packId: string) => {
    const pack = testPacks.find(p => p.id === packId);
    setTestPacks(prev => prev.filter(p => p.id !== packId));
    if (pack) {
      setSystems(prev => prev.filter(s => s.id !== pack.systemId));
    }
    const newCases = { ...testCases };
    delete newCases[packId];
    setTestCases(newCases);
  };

  const getSystem = (id: string) => systems.find(s => s.id === id);
  const getPack = (id: string) => testPacks.find(p => p.id === id);
  const getCases = (packId: string) => testCases[packId] || [];

  const value = {
    systems,
    testPacks,
    testCases,
    updateSystem,
    updatePack,
    updateCases,
    deletePack,
    getSystem,
    getPack,
    getCases
  };

  return (
    <MemoryStoreContext.Provider value={value}>
      {children}
    </MemoryStoreContext.Provider>
  );
}

export function useMemoryStore() {
  const context = useContext(MemoryStoreContext);
  if (context === undefined) {
    throw new Error('useMemoryStore must be used within a MemoryStoreProvider');
  }
  return context;
}
