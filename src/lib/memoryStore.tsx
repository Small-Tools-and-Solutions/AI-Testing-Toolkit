/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { AISystem, TestPack, TestCase } from '../types';

const STORAGE_KEY = 'cipherwatch_audit_registry_v1';

interface StoredData {
  systems: AISystem[];
  testPacks: TestPack[];
  testCases: Record<string, TestCase[]>;
}

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
  const [data, setData] = useState<StoredData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredData;
        return {
          systems: parsed.systems || [],
          testPacks: parsed.testPacks || [],
          testCases: parsed.testCases || {}
        };
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    return { systems: [], testPacks: [], testCases: {} };
  });

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateSystem = useCallback((system: AISystem) => {
    setData(prev => ({
      ...prev,
      systems: prev.systems.find(s => s.id === system.id)
        ? prev.systems.map(s => s.id === system.id ? system : s)
        : [...prev.systems, system]
    }));
  }, []);

  const updatePack = useCallback((pack: TestPack) => {
    setData(prev => ({
      ...prev,
      testPacks: prev.testPacks.find(p => p.id === pack.id)
        ? prev.testPacks.map(p => p.id === pack.id ? pack : p)
        : [...prev.testPacks, pack]
    }));
  }, []);

  const updateCases = useCallback((packId: string, cases: TestCase[]) => {
    setData(prev => ({
      ...prev,
      testCases: { ...prev.testCases, [packId]: cases }
    }));
  }, []);

  const deletePack = useCallback((packId: string) => {
    setData(prev => {
      const pack = prev.testPacks.find(p => p.id === packId);
      const newPacks = prev.testPacks.filter(p => p.id !== packId);
      const newSystems = pack ? prev.systems.filter(s => s.id !== pack.systemId) : prev.systems;
      const newCases = { ...prev.testCases };
      delete newCases[packId];
      
      return {
        systems: newSystems,
        testPacks: newPacks,
        testCases: newCases
      };
    });
  }, []);

  const getSystem = useCallback((id: string) => data.systems.find(s => s.id === id), [data.systems]);
  const getPack = useCallback((id: string) => data.testPacks.find(p => p.id === id), [data.testPacks]);
  const getCases = useCallback((packId: string) => data.testCases[packId] || [], [data.testCases]);

  const value = useMemo(() => ({
    systems: data.systems,
    testPacks: data.testPacks,
    testCases: data.testCases,
    updateSystem,
    updatePack,
    updateCases,
    deletePack,
    getSystem,
    getPack,
    getCases
  }), [data.systems, data.testPacks, data.testCases, updateSystem, updatePack, updateCases, deletePack, getSystem, getPack, getCases]);

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
