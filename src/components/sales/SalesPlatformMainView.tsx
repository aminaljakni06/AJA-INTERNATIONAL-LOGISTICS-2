import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  TrendingUp,
  Target,
  FileText,
  ShieldAlert,
  MapPin,
  Sparkles,
  RefreshCw,
  Building2,
  DollarSign,
  Award
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LeadManager } from './LeadManager';
import { OpportunityPipelineBoard } from './OpportunityPipelineBoard';
import { SalesForecastDashboard } from './SalesForecastDashboard';
import { ProposalManager } from './ProposalManager';
import { CompetitorWinLossCenter } from './CompetitorWinLossCenter';
import { TerritoriesTargetCenter } from './TerritoriesTargetCenter';
import { AISalesCopilotPanel } from './AISalesCopilotPanel';
import {
  Lead,
  Opportunity,
  SalesKpiSummary,
  Proposal,
  Competitor,
  WinLossRecord,
  SalesTerritory,
  SalesTarget,
  CommissionRule,
  SalesStage
} from '../../types/sales';

export const SalesPlatformMainView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'LEADS' | 'OPPORTUNITIES' | 'FORECAST' | 'PROPOSALS' | 'COMPETITORS' | 'TERRITORIES' | 'AI_COPILOT'
  >('LEADS');

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<SalesKpiSummary | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [winLossRecords, setWinLossRecords] = useState<WinLossRecord[]>([]);
  const [territories, setTerritories] = useState<SalesTerritory[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        kpisRes,
        leadsRes,
        oppsRes,
        propsRes,
        compRes,
        wlRes,
        terrRes,
        tgtRes,
        commRes,
      ] = await Promise.all([
        fetch('/api/crm/sales/kpis').then(r => r.json()),
        fetch('/api/crm/sales/leads').then(r => r.json()),
        fetch('/api/crm/sales/opportunities').then(r => r.json()),
        fetch('/api/crm/sales/proposals').then(r => r.json()),
        fetch('/api/crm/sales/competitors').then(r => r.json()),
        fetch('/api/crm/sales/win-loss').then(r => r.json()),
        fetch('/api/crm/sales/territories').then(r => r.json()),
        fetch('/api/crm/sales/targets').then(r => r.json()),
        fetch('/api/crm/sales/commission-rules').then(r => r.json()),
      ]);

      setKpis(kpisRes);
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
      setOpportunities(Array.isArray(oppsRes) ? oppsRes : []);
      setProposals(Array.isArray(propsRes) ? propsRes : []);
      setCompetitors(Array.isArray(compRes) ? compRes : []);
      setWinLossRecords(Array.isArray(wlRes) ? wlRes : []);
      setTerritories(Array.isArray(terrRes) ? terrRes : []);
      setTargets(Array.isArray(tgtRes) ? tgtRes : []);
      setCommissionRules(Array.isArray(commRes) ? commRes : []);
    } catch (err) {
      console.error('[SalesPlatformMainView] Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    await fetch('/api/crm/sales/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    await fetchAllData();
  };

  const handleConvertLead = async (
    leadId: string,
    data: { opportunityName: string; expectedRevenue: number; expectedCloseDate: string; createCustomer360Profile: boolean }
  ) => {
    await fetch(`/api/crm/sales/leads/${leadId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchAllData();
  };

  const handleUpdateOpportunityStage = async (
    id: string,
    stage: SalesStage,
    wonLostReason?: { wonReason?: string; lostReason?: string; competitorLostTo?: string }
  ) => {
    await fetch(`/api/crm/sales/opportunities/${id}/stage-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, ...wonLostReason }),
    });
    await fetchAllData();
  };

  const handleSaveOpportunity = async (oppData: Partial<Opportunity>) => {
    await fetch('/api/crm/sales/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oppData),
    });
    await fetchAllData();
  };

  const handleSaveProposal = async (propData: Partial<Proposal>) => {
    await fetch('/api/crm/sales/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propData),
    });
    await fetchAllData();
  };

  const handleFetchAIInsights = async () => {
    const res = await fetch('/api/crm/sales/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads, opportunities }),
    });
    return await res.json();
  };

  return (
    <div className="space-y-6">
      {/* Platform Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">منصة إدارة المبيعات والأنبوب البيعي (Enterprise Sales Platform)</h1>
            <span className="text-[10px] font-mono font-bold bg-[#EA580C]/20 text-[#EA580C] px-2 py-0.5 rounded-full border border-[#EA580C]/30">
              ALBP-004.002
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة دورة المبيعات اللوجستية الشاملة: العملاء المحتملين، الفرص البيعية، التنبؤات الماليّة، المنافسين والعمولات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchAllData} disabled={loading} className="text-xs flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </Button>
        </div>
      </div>

      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">إجمالي الأنبوب النشط</div>
          <div className="text-sm font-bold text-slate-100 font-mono mt-1">
            {kpis?.totalPipelineValue.toLocaleString()} SAR
          </div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">العملاء المحتملون</div>
          <div className="text-sm font-bold text-slate-100 font-mono mt-1">{kpis?.totalActiveLeads ?? leads.length} عملاء</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">الفرص البيعية النشطة</div>
          <div className="text-sm font-bold text-slate-100 font-mono mt-1">{opportunities.length} صفقة</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">إحراز المستهدف القومي</div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-1">{kpis?.targetAchievementPct}%</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">معدل الفوز بالمناقصات</div>
          <div className="text-sm font-bold text-sky-400 font-mono mt-1">{kpis?.overallWinRatePct}%</div>
        </Card>

        <Card className="p-3 bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] text-slate-400">متوسط دورة الإغلاق</div>
          <div className="text-sm font-bold text-purple-400 font-mono mt-1">{kpis?.avgDealCycleDays} يوماً</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('LEADS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'LEADS' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>العملاء المحتملون (Leads)</span>
        </button>

        <button
          onClick={() => setActiveTab('OPPORTUNITIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'OPPORTUNITIES' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>الأنبوب والفرص (Pipeline)</span>
        </button>

        <button
          onClick={() => setActiveTab('FORECAST')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'FORECAST' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>التنبؤات المالية (Forecast)</span>
        </button>

        <button
          onClick={() => setActiveTab('PROPOSALS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'PROPOSALS' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>العروض والأسعار (Proposals)</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPETITORS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'COMPETITORS' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>المنافسون وسجل Win/Loss</span>
        </button>

        <button
          onClick={() => setActiveTab('TERRITORIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'TERRITORIES' ? 'bg-[#EA580C] text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>الأقاليم والعمولات</span>
        </button>

        <button
          onClick={() => setActiveTab('AI_COPILOT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'AI_COPILOT'
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-sky-400 border border-sky-500/30 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>مساعد المبيعات الذكي AI</span>
        </button>
      </div>

      {/* Active Tab View Rendering */}
      <div>
        {activeTab === 'LEADS' && (
          <LeadManager
            leads={leads}
            loading={loading}
            onRefresh={fetchAllData}
            onSaveLead={handleSaveLead}
            onConvertLead={handleConvertLead}
          />
        )}

        {activeTab === 'OPPORTUNITIES' && (
          <OpportunityPipelineBoard
            opportunities={opportunities}
            loading={loading}
            onRefresh={fetchAllData}
            onUpdateStage={handleUpdateOpportunityStage}
            onSaveOpportunity={handleSaveOpportunity}
          />
        )}

        {activeTab === 'FORECAST' && (
          <SalesForecastDashboard kpis={kpis} opportunities={opportunities} />
        )}

        {activeTab === 'PROPOSALS' && (
          <ProposalManager
            proposals={proposals}
            loading={loading}
            onRefresh={fetchAllData}
            onSaveProposal={handleSaveProposal}
          />
        )}

        {activeTab === 'COMPETITORS' && (
          <CompetitorWinLossCenter
            competitors={competitors}
            winLossRecords={winLossRecords}
            loading={loading}
          />
        )}

        {activeTab === 'TERRITORIES' && (
          <TerritoriesTargetCenter
            territories={territories}
            targets={targets}
            commissionRules={commissionRules}
            loading={loading}
          />
        )}

        {activeTab === 'AI_COPILOT' && (
          <AISalesCopilotPanel onFetchAIInsights={handleFetchAIInsights} />
        )}
      </div>
    </div>
  );
};
