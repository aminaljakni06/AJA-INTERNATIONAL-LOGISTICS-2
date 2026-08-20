import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Company,
  Branch,
  Department,
  Team,
  CostCenter,
  OrganizationSettings,
  ReportingTreeNode,
} from '../types/organization';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  company: Company | null;
  currentBranch: Branch | null;
  branches: Branch[];
  departments: Department[];
  teams: Team[];
  costCenters: CostCenter[];
  settings: OrganizationSettings | null;
  hierarchy: ReportingTreeNode | null;
  loading: boolean;
  setCurrentBranchId: (branchId: string) => void;
  refreshOrganization: () => Promise<void>;
  filterByBranch: <T extends { branchId?: string | null }>(items: T[]) => T[];
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

async function fetchOrganizationResource<T>(path: string, token: string): Promise<T> {
  const res = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || payload?.messageEn || 'Failed to fetch organization data');
  }

  return (payload?.data ?? payload) as T;
}

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [hierarchy, setHierarchy] = useState<ReportingTreeNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) {
        setCompany(null);
        setBranches([]);
        setDepartments([]);
        setTeams([]);
        setCostCenters([]);
        setSettings(null);
        setHierarchy(null);
        setCurrentBranch(null);
        return;
      }

      const companyId = user?.companyId || 'aja-holding';
      const query = new URLSearchParams({ companyId });
      const [comp, branchList, deptList, teamList, ccList, orgSettings, orgHierarchy] =
        await Promise.all([
          fetchOrganizationResource<Company>(`/api/organization/company?${query.toString()}`, token),
          fetchOrganizationResource<Branch[]>(`/api/organization/branches?${query.toString()}`, token),
          fetchOrganizationResource<Department[]>(`/api/organization/departments?${query.toString()}`, token),
          fetchOrganizationResource<Team[]>('/api/organization/teams', token),
          fetchOrganizationResource<CostCenter[]>(`/api/organization/cost-centers?${query.toString()}`, token),
          fetchOrganizationResource<OrganizationSettings>(`/api/organization/settings?${query.toString()}`, token),
          fetchOrganizationResource<ReportingTreeNode>('/api/organization/hierarchy', token),
        ]);

      setCompany(comp);
      setBranches(branchList);
      setDepartments(deptList);
      setTeams(teamList);
      setCostCenters(ccList);
      setSettings(orgSettings);
      setHierarchy(orgHierarchy);

      // Select user's branch or default headquarters branch
      const userBranchId = user?.branchId;
      const initialBranch =
        branchList.find((b) => b.id === userBranchId) ||
        branchList.find((b) => b.isHeadquarters) ||
        branchList[0] ||
        null;

      setCurrentBranch(initialBranch);
    } catch (err) {
      console.error('[OrganizationProvider] Error loading organization data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSetCurrentBranchId = useCallback(
    (branchId: string) => {
      const found = branches.find((b) => b.id === branchId);
      if (found) {
        setCurrentBranch(found);
      }
    },
    [branches]
  );

  const filterByBranch = useCallback(
    <T extends { branchId?: string | null }>(items: T[]): T[] => {
      if (!currentBranch) return items;
      return items.filter(
        (item) => !item.branchId || item.branchId === currentBranch.id
      );
    },
    [currentBranch]
  );

  return (
    <OrganizationContext.Provider
      value={{
        company,
        currentBranch,
        branches,
        departments,
        teams,
        costCenters,
        settings,
        hierarchy,
        loading,
        setCurrentBranchId: handleSetCurrentBranchId,
        refreshOrganization: loadData,
        filterByBranch,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
