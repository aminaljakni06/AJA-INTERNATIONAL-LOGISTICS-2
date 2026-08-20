import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Clock,
  Activity,
  MessageSquare,
  Network,
  FileText,
  Sparkles,
  Search,
  RefreshCw,
  Award,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { useAuth } from '../../../context/AuthContext';
import {
  Customer360Profile,
  CustomerTimelineEntry,
  CustomerCommunicationEntry,
  CustomerActivityTask,
  CustomerDocument360,
  CustomerAIInsights,
  Customer360KpiSummary
} from '../../../types/customer360';

import { Customer360Dashboard } from './Customer360Dashboard';
import { Customer360ProfileView } from './Customer360ProfileView';
import { CustomerTimelineViewer } from './CustomerTimelineViewer';
import { CustomerHealthDashboard } from './CustomerHealthDashboard';
import { CustomerActivityCenter } from './CustomerActivityCenter';
import { CustomerRelationshipViewer } from './CustomerRelationshipViewer';
import { CustomerDocumentCenter } from './CustomerDocumentCenter';
import { CustomerAIInsightsPanel } from './CustomerAIInsightsPanel';

export const Customer360MainView: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<Customer360Profile[]>([]);
  const [kpis, setKpis] = useState<Customer360KpiSummary | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer360Profile | null>(null);

  // Sub-data for selected customer
  const [timeline, setTimeline] = useState<CustomerTimelineEntry[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunicationEntry[]>([]);
  const [activities, setActivities] = useState<CustomerActivityTask[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument360[]>([]);
  const [insights, setInsights] = useState<CustomerAIInsights | null>(null);
  const [loadingSubData, setLoadingSubData] = useState<boolean>(false);

  // Search Filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpiRes = await fetch('/api/crm/customer-360/kpis', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (kpiRes.ok) {
        const kData = await kpiRes.json();
        setKpis(kData);
      }

      // Fetch Customers list
      const custRes = await fetch('/api/crm/customer-360', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (custRes.ok) {
        const cData = await custRes.json();
        setCustomers(Array.isArray(cData) ? cData : []);
        if (cData.length > 0 && !selectedCustomer) {
          setSelectedCustomer(cData[0]);
        }
      }
    } catch (err) {
      console.error('[Customer360MainView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSubData = async (cust: Customer360Profile) => {
    setLoadingSubData(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Timeline
      const tRes = await fetch(`/api/crm/customer-360/${cust.id}/timeline`, { headers });
      if (tRes.ok) setTimeline(await tRes.json());

      // Communications
      const cRes = await fetch(`/api/crm/customer-360/${cust.id}/communications`, { headers });
      if (cRes.ok) setCommunications(await cRes.json());

      // Activities
      const aRes = await fetch(`/api/crm/customer-360/${cust.id}/activities`, { headers });
      if (aRes.ok) setActivities(await aRes.json());

      // Documents
      const dRes = await fetch(`/api/crm/customer-360/${cust.id}/documents`, { headers });
      if (dRes.ok) setDocuments(await dRes.json());

      // AI Insights
      const iRes = await fetch(`/api/crm/customer-360/${cust.id}/ai-insights`, { headers });
      if (iRes.ok) setInsights(await iRes.json());
    } catch (err) {
      console.error('[Customer360MainView] Fetch sub-data error:', err);
    } finally {
      setLoadingSubData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerSubData(selectedCustomer);
    }
  }, [selectedCustomer?.id]);

  const handleSaveProfile = async (updated: Customer360Profile) => {
    try {
      const res = await fetch('/api/crm/customer-360', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const saved = await res.json();
        setSelectedCustomer(saved);
        setCustomers((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      }
    } catch (err) {
      console.error('[Customer360MainView] Save error:', err);
    }
  };

  const handleRecordTimelineEvent = async (event: Omit<CustomerTimelineEntry, 'id'>) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customer-360/${selectedCustomer.id}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(event),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setTimeline((prev) => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error('[Customer360MainView] Record event error:', err);
    }
  };

  const handleAddCommunication = async (comm: Omit<CustomerCommunicationEntry, 'id'>) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customer-360/${selectedCustomer.id}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(comm),
      });

      if (res.ok) {
        const newComm = await res.json();
        setCommunications((prev) => [newComm, ...prev]);
      }
    } catch (err) {
      console.error('[Customer360MainView] Add comm error:', err);
    }
  };

  const handleAddActivity = async (act: Omit<CustomerActivityTask, 'id' | 'createdAt'>) => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customer-360/${selectedCustomer.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(act),
      });

      if (res.ok) {
        const newAct = await res.json();
        setActivities((prev) => [newAct, ...prev]);
      }
    } catch (err) {
      console.error('[Customer360MainView] Add activity error:', err);
    }
  };

  const handleRefreshInsights = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/crm/customer-360/${selectedCustomer.id}/ai-insights`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setInsights(await res.json());
      }
    } catch (err) {
      console.error('[Customer360MainView] Refresh insights error:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner label="جاري استدعاء منصة العميل 360 الموحدة..." />;
  }

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم 360', icon: Building2 },
    { id: 'profile', label: 'الملف الموحد', icon: Users },
    { id: 'timeline', label: 'التسلسل الزمني', icon: Clock },
    { id: 'health', label: 'مؤشر الصحة والمخاطر', icon: Activity },
    { id: 'activity', label: 'التواصل والمهام', icon: MessageSquare },
    { id: 'relationships', label: 'هيكلية الحسابات', icon: Network },
    { id: 'documents', label: 'مركز المستندات', icon: FileText },
    { id: 'ai-insights', label: 'رؤى الذكاء الاصطناعي', icon: Sparkles },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header & Customer Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700">
        <div>
          <h1 className="text-xl font-extrabold text-amber-400 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            <span>منصة العميل 360 الموحدة (Enterprise Customer 360 Platform)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            مركز الرؤية الشاملة للعملاء، التسلسل الزمني للأحداث، مؤشرات الصحة، وتقييم المخاطر الذكي
          </p>
        </div>

        {/* Customer Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">العميل المحدد:</span>
          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const found = customers.find((c) => c.id === e.target.value);
              if (found) setSelectedCustomer(found);
            }}
            className="px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 max-w-xs"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} ({c.id})
              </option>
            ))}
          </select>

          <Button onClick={fetchInitialData} variant="outline" size="sm" className="gap-1.5 text-xs text-slate-200 border-slate-600">
            <RefreshCw className="w-3.5 h-3.5" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-700 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'dashboard' && (
          <Customer360Dashboard
            kpis={kpis}
            customers={customers}
            recentTimeline={timeline}
            onSelectCustomer={(cust) => {
              setSelectedCustomer(cust);
              setActiveTab('profile');
            }}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {selectedCustomer && activeTab === 'profile' && (
          <Customer360ProfileView customer={selectedCustomer} onSaveProfile={handleSaveProfile} />
        )}

        {selectedCustomer && activeTab === 'timeline' && (
          <CustomerTimelineViewer timeline={timeline} onRecordEvent={handleRecordTimelineEvent} />
        )}

        {selectedCustomer && activeTab === 'health' && (
          <CustomerHealthDashboard
            customer={selectedCustomer}
            onRecalculate={() => fetchCustomerSubData(selectedCustomer)}
          />
        )}

        {selectedCustomer && activeTab === 'activity' && (
          <CustomerActivityCenter
            communications={communications}
            activities={activities}
            onAddCommunication={handleAddCommunication}
            onAddActivity={handleAddActivity}
          />
        )}

        {selectedCustomer && activeTab === 'relationships' && (
          <CustomerRelationshipViewer
            customer={selectedCustomer}
            allCustomers={customers}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
          />
        )}

        {selectedCustomer && activeTab === 'documents' && (
          <CustomerDocumentCenter documents={documents} />
        )}

        {selectedCustomer && activeTab === 'ai-insights' && (
          <CustomerAIInsightsPanel
            customer={selectedCustomer}
            insights={insights}
            onRefreshInsights={handleRefreshInsights}
          />
        )}
      </div>
    </div>
  );
};
