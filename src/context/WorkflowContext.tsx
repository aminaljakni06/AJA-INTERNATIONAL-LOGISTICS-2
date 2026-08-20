import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  WorkflowInstance,
  WorkflowTask,
  WorkflowTemplate,
  StartWorkflowInput,
  WorkflowTransitionInput,
  WorkflowCategory,
} from '../types/workflow';
import { useAuth } from './AuthContext';
import { useOrganization } from '../hooks/useOrganization';

interface WorkflowContextType {
  templates: WorkflowTemplate[];
  tasks: WorkflowTask[];
  activeInstance: WorkflowInstance | null;
  startWorkflow: (input: Omit<StartWorkflowInput, 'initiatedByUserId' | 'initiatedByUserName'>) => Promise<{
    instance: WorkflowInstance;
    initialTask?: WorkflowTask;
  }>;
  transitionWorkflow: (input: WorkflowTransitionInput) => Promise<{
    instance: WorkflowInstance;
    nextTask?: WorkflowTask;
  }>;
  selectInstance: (instanceId: string | null) => void;
  refreshTasks: () => void;
  runSLACheck: () => { escalatedInstances: number; escalatedTasks: number };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

async function fetchWorkflowResource<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || payload?.messageEn || 'Failed to fetch workflow data');
  }

  return (payload?.data ?? payload) as T;
}

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { company, currentBranch } = useOrganization();

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [activeInstance, setActiveInstance] = useState<WorkflowInstance | null>(null);

  const refreshTasks = useCallback(() => {
    if (!token) {
      setTasks([]);
      return;
    }

    const params = new URLSearchParams();
    if (user?.id) params.set('userId', user.id);
    if (user?.role) params.set('role', user.role);
    if (currentBranch?.id) params.set('branchId', currentBranch.id);

    void fetchWorkflowResource<{ tasks: WorkflowTask[] }>(`/api/workflow/tasks?${params.toString()}`, token)
      .then((payload) => setTasks(payload.tasks))
      .catch((err) => {
        console.error('[WorkflowProvider] Failed to refresh tasks:', err);
      });
  }, [user, currentBranch, token]);

  useEffect(() => {
    if (!token) {
      setTemplates([]);
      setTasks([]);
      setActiveInstance(null);
      return;
    }

    void fetchWorkflowResource<{ templates: WorkflowTemplate[] }>('/api/workflow/templates', token)
      .then((payload) => setTemplates(payload.templates))
      .catch((err) => {
        console.error('[WorkflowProvider] Failed to load workflow templates:', err);
      });

    refreshTasks();

    const interval = setInterval(refreshTasks, 15000);
    return () => clearInterval(interval);
  }, [refreshTasks, token]);

  const selectInstance = useCallback((instanceId: string | null) => {
    if (!instanceId) {
      setActiveInstance(null);
      return;
    }
    if (!token) return;

    void fetchWorkflowResource<{ instance: WorkflowInstance }>(`/api/workflow/instances/${instanceId}`, token)
      .then((payload) => setActiveInstance(payload.instance || null))
      .catch((err) => {
        console.error('[WorkflowProvider] Failed to select workflow instance:', err);
        setActiveInstance(null);
      });
  }, [token]);

  const startWorkflow = useCallback(
    async (input: Omit<StartWorkflowInput, 'initiatedByUserId' | 'initiatedByUserName'>) => {
      const fullInput: StartWorkflowInput = {
        ...input,
        initiatedByUserId: user?.id || 'sys_user',
        initiatedByUserName: user?.fullName || 'Authorized User',
        companyId: input.companyId || company?.id || 'aja-holding',
        branchId: input.branchId || currentBranch?.id,
      };

      if (!token) throw new Error('Authentication token is required to start workflow.');
      const result = await fetchWorkflowResource<{
        instance: WorkflowInstance;
        initialTask?: WorkflowTask;
      }>('/api/workflow/start', token, {
        method: 'POST',
        body: JSON.stringify(fullInput),
      });
      setActiveInstance(result.instance);
      refreshTasks();
      return result;
    },
    [user, company, currentBranch, refreshTasks, token]
  );

  const transitionWorkflow = useCallback(
    async (input: WorkflowTransitionInput) => {
      if (!token) throw new Error('Authentication token is required to transition workflow.');
      const result = await fetchWorkflowResource<{
        instance: WorkflowInstance;
        nextTask?: WorkflowTask;
      }>('/api/workflow/transition', token, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setActiveInstance(result.instance);
      refreshTasks();
      return result;
    },
    [refreshTasks, token]
  );

  const runSLACheck = useCallback(() => {
    if (!token) return { escalatedInstances: 0, escalatedTasks: 0 };

    void fetchWorkflowResource<{ stats: { escalatedInstances: number; escalatedTasks: number } }>(
      '/api/workflow/sla/check',
      token,
      { method: 'POST', body: JSON.stringify({}) }
    )
      .then(() => refreshTasks())
      .catch((err) => {
        console.error('[WorkflowProvider] Failed to run SLA check:', err);
      });

    return { escalatedInstances: 0, escalatedTasks: 0 };
  }, [refreshTasks, token]);

  return (
    <WorkflowContext.Provider
      value={{
        templates,
        tasks,
        activeInstance,
        startWorkflow,
        transitionWorkflow,
        selectInstance,
        refreshTasks,
        runSLACheck,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
