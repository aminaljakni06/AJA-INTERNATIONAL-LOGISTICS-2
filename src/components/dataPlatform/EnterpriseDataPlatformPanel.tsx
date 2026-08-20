import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Server,
  Activity,
  ShieldCheck,
  Search,
  Zap,
  RefreshCw,
  Sparkles,
  GitCommit,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Cpu,
  BarChart3,
  Globe2,
  Clock,
  Play,
  Users,
  Award,
  Sliders,
  FileText,
  DollarSign,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const EnterpriseDataPlatformPanel: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'lakehouse' | 'mdm' | 'catalog' | 'pipelines' | 'bi' | 'governance'>('lakehouse');

  // Core Data States
  const [overview, setOverview] = useState<any>(null);
  const [lakehouseDatasets, setLakehouseDatasets] = useState<any[]>([]);
  const [warehouseMarts, setWarehouseMarts] = useState<any[]>([]);
  const [goldenRecords, setGoldenRecords] = useState<any[]>([]);
  const [catalogAssets, setCatalogAssets] = useState<any[]>([]);
  const [lineage, setLineage] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [semanticMetrics, setSemanticMetrics] = useState<any[]>([]);
  const [executiveBi, setExecutiveBi] = useState<any>(null);

  // Filter & Interaction States
  const [catalogSearch, setCatalogSearch] = useState('');
  const [mdmDomainFilter, setMdmDomainFilter] = useState('');
  const [selectedMetricId, setSelectedMetricId] = useState('METRIC-FIN-01');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggeringPipeline, setTriggeringPipeline] = useState(false);

  useEffect(() => {
    fetchAllPlatformData();
  }, []);

  const fetchAllPlatformData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        lakeRes,
        martRes,
        mdmRes,
        catRes,
        dqRes,
        pipeRes,
        semRes,
        biRes,
      ] = await Promise.all([
        fetch('/api/data-platform/overview', { headers }),
        fetch('/api/data-platform/lakehouse/datasets', { headers }),
        fetch('/api/data-platform/warehouse/marts', { headers }),
        fetch('/api/data-platform/mdm/golden-records', { headers }),
        fetch('/api/data-platform/catalog', { headers }),
        fetch('/api/data-platform/quality', { headers }),
        fetch('/api/data-platform/pipelines', { headers }),
        fetch('/api/data-platform/semantic-layer', { headers }),
        fetch('/api/data-platform/bi/dashboard', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (lakeRes.ok) {
        const data = await lakeRes.json();
        setLakehouseDatasets(data.datasets || []);
      }
      if (martRes.ok) {
        const data = await martRes.json();
        setWarehouseMarts(data.marts || []);
      }
      if (mdmRes.ok) {
        const data = await mdmRes.json();
        setGoldenRecords(data.records || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCatalogAssets(data.assets || []);
        setLineage(data.lineage || null);
      }
      if (dqRes.ok) {
        const data = await dqRes.json();
        setQualityMetrics(data.metrics || []);
      }
      if (pipeRes.ok) {
        const data = await pipeRes.json();
        setPipelines(data.executions || []);
        setTopics(data.topics || []);
      }
      if (semRes.ok) {
        const data = await semRes.json();
        setSemanticMetrics(data.metrics || []);
      }
      if (biRes.ok) {
        setExecutiveBi(await biRes.json());
      }
    } catch (err) {
      console.error('Error fetching data platform metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPipeline = async (pipelineName: string) => {
    setTriggeringPipeline(true);
    try {
      const res = await fetch('/api/data-platform/pipelines/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pipelineName }),
      });
      if (res.ok) {
        await fetchAllPlatformData();
      }
    } catch (err) {
      console.error('Error triggering pipeline', err);
    } finally {
      setTriggeringPipeline(false);
    }
  };

  const handleRunSelfServiceQuery = async () => {
    try {
      const res = await fetch('/api/data-platform/bi/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ metricId: selectedMetricId, groupBy: 'B2B_SECTOR' }),
      });
      if (res.ok) {
        setQueryResult(await res.json());
      }
    } catch (err) {
      console.error('Error running self service BI query', err);
    }
  };

  const filteredGoldenRecords = mdmDomainFilter
    ? goldenRecords.filter((r) => r.masterDomain.toLowerCase() === mdmDomainFilter.toLowerCase())
    : goldenRecords;

  const filteredCatalog = catalogSearch
    ? catalogAssets.filter(
        (a) =>
          a.assetName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          a.descriptionAr.includes(catalogSearch) ||
          a.domain.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : catalogAssets;

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-lg">
            <Database className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">منصة البيانات المؤسسية وبحيرة البيانات الذكية (Data Lakehouse & BI)</h1>
              <Badge className="bg-indigo-400/20 text-indigo-300 border-indigo-400/40 text-[10px] font-extrabold">
                Single Source of Truth
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              سجل الحقيقة الموحد لكافة البيانات التشغيلية، المالية، اللوجستية، إدارة البيانات المرجعية (MDM)، حوكمة وجودة البيانات، والتحليلات الاستراتيجية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllPlatformData}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-2 transition-all font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {overview?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">إجمالي التخزين المؤسسي</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 font-mono">{overview.summary.totalStorageGB}</span>
              <span className="text-xs text-slate-500 font-bold">GB</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold">Lakehouse + DW Marts</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">جودة البيانات المؤسسية</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{overview.summary.avgQualityScore}%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">100% Validated Clean</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">السجلات الذهبية (MDM)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 font-mono">{overview.summary.goldenRecordsCount}</span>
              <span className="text-xs text-slate-500 font-bold">Records</span>
            </div>
            <span className="text-[10px] text-sky-600 font-bold">Customer, Fleet, WH</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">مجموعات بحيرة البيانات</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#0F4C75] font-mono">{overview.summary.lakehouseDatasetsCount}</span>
              <span className="text-xs text-slate-500 font-bold">Datasets</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">Bronze, Silver, Gold</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 block">خطوط الأنابيب النشطة</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-600 font-mono">{overview.summary.activePipelinesCount}</span>
              <span className="text-xs text-slate-500 font-bold">Active</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">CDC & Realtime Stream</span>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lakehouse')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'lakehouse'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>بحيرة البيانات ومستودع البيانات (Lakehouse & DW)</span>
        </button>

        <button
          onClick={() => setActiveTab('mdm')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'mdm'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>إدارة البيانات المرجعية (MDM Golden Records)</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>كتالوج البيانات والتتبع الهيكلي (Catalog & Lineage)</span>
        </button>

        <button
          onClick={() => setActiveTab('pipelines')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'pipelines'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>خطوط الأنابيب والتكافؤ اللحظي (ETL/ELT & CDC)</span>
        </button>

        <button
          onClick={() => setActiveTab('bi')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'bi'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ذكاء الأعمال والطبقة الدلالية (BI & Semantic Layer)</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'governance'
              ? 'bg-[#0F172A] text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>الحوكمة وبنية الذكاء الاصطناعي (Governance & AI Data)</span>
        </button>
      </div>

      {/* TAB 1: Lakehouse & Data Warehouse Engine */}
      {activeTab === 'lakehouse' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>طبقات بحيرة البيانات (Lakehouse Layered Datasets)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  هيكلية الحفظ الموزعة (Bronze Raw ➔ Silver Cleansed ➔ Gold Curated ➔ AI Feature Store) بتنسيقات Delta/Parquet/Iceberg.
                </p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-mono">
                ACID Transactions & Time Travel
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lakehouseDatasets.map((ds) => (
                <div key={ds.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900 truncate">{ds.name}</span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        ds.layer === 'RAW_BRONZE'
                          ? 'bg-amber-100 text-amber-800'
                          : ds.layer === 'CLEANSED_SILVER'
                          ? 'bg-slate-200 text-slate-800'
                          : ds.layer === 'CURATED_GOLD'
                          ? 'bg-amber-500 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {ds.layer}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>المصدر الأصل:</span>
                      <span className="font-extrabold text-slate-900">{ds.sourceSystem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تنسيق الملف:</span>
                      <span className="font-mono font-bold text-indigo-700">{ds.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>عدد السجلات:</span>
                      <span className="font-mono text-slate-900">{ds.recordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الحجم الإجمالي:</span>
                      <span className="font-mono text-slate-900">{ds.sizeMB} MB</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">Ver: {ds.schemaVersion}</span>
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded">
                      Time Travel Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Warehouse Marts */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-sky-600" />
                  <span>متاجر بيانات مستودع البيانات المؤسسي (Enterprise DW Data Marts)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  نماذج Star Schema و Snowflake Schema مع تفعيل البُعد بطيء التغير SCD Type 2.
                </p>
              </div>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-mono">
                Star & Snowflake Schema
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouseMarts.map((mart) => (
                <div key={mart.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{mart.martName}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      Rows: {(mart.totalRows / 1000000).toFixed(1)}M
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-900 font-extrabold">
                      <span>Fact Table:</span>
                      <span className="font-mono">{mart.starSchemaConfig.factTable}</span>
                    </div>
                    <div className="text-slate-600 pt-1">
                      <span className="font-bold text-slate-700 block mb-1">Dimension Tables ({mart.starSchemaConfig.dimensionTables.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {mart.starSchemaConfig.dimensionTables.map((dim: string, i: number) => (
                          <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono text-slate-700">
                            {dim}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Master Data Management (MDM) Golden Records */}
      {activeTab === 'mdm' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>إدارة البيانات المرجعية والسجلات الذهبية (Master Data Management - Golden Records)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توحيد هوية العملاء، الموردين، المستودعات، والأسطول ومنع تكرار البيانات مع إسناد المسؤولية للمشرف المعتمد (Data Steward).
              </p>
            </div>
            <select
              value={mdmDomainFilter}
              onChange={(e) => setMdmDomainFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none"
            >
              <option value="">جميع القطاعات المرجعية (All Domains)</option>
              <option value="CUSTOMER">العملاء (Customers)</option>
              <option value="CARRIER">الناقلون الملاحيون (Carriers)</option>
              <option value="WAREHOUSE">المستودعات (Warehouses)</option>
              <option value="VEHICLE">الأسطول والشاحنات (Vehicles)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoldenRecords.map((rec) => (
              <div key={rec.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:border-[#0F4C75] transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-extrabold">
                      {rec.globalIdentifier}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 mt-1">{rec.entityNameAr}</h3>
                    <p className="text-xs text-slate-500 font-mono">{rec.entityNameEn}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
                    Quality: {rec.qualityScore}%
                  </Badge>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الانظمة المترابطة:</span>
                    <span className="font-bold text-slate-800">{rec.sourceSystemsSynced.join(' • ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">المشرف المعتمد (Data Steward):</span>
                    <span className="font-bold text-[#0F4C75]">{rec.dataSteward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">حالة الاعتماد:</span>
                    <span className="font-bold text-emerald-700">{rec.approvalStatus}</span>
                  </div>
                </div>

                <div className="text-[11px] space-y-1 pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block">السمات المرجعية الذهبية:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                    {Object.entries(rec.attributes || {}).map(([k, v], i) => (
                      <div key={i} className="truncate">
                        • <span className="text-slate-500">{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: Data Catalog, Lineage & Quality */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <span>كتالوج البيانات ومحرك تتبع المسار الهيكلي (Data Catalog & Lineage)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  فهرس كامل لكافة الجداول، الواجهات البرمجية، ونماذج الذكاء الاصطناعي مع إظهار شجرة التتبع من المصدر حتى التقارير.
                </p>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="ابحث في الكتالوج..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map((asset) => (
                <div key={asset.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900">{asset.assetName}</span>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-mono">
                      {asset.assetType}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700">{asset.descriptionAr}</p>

                  <div className="flex flex-wrap gap-1">
                    {asset.tags?.map((t: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                    <div>
                      <span className="font-bold text-slate-700">المصادر السابقة (Upstream):</span> {asset.upstreamDependencies.join(', ')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">المستفيدون (Downstream):</span> {asset.downstreamConsumers.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual End-to-End Lineage Flow */}
            {lineage && (
              <div className="bg-[#0F172A] p-5 rounded-2xl text-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-black text-xs text-indigo-300 flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-indigo-400" />
                    <span>مخطط التتبع الهيكلي الشامل من المصدر حتى الذكاء الاصطناعي (End-to-End Lineage Flow)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Pipeline Architecture</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 py-4 text-xs">
                  {lineage.nodes?.map((node: any, idx: number) => (
                    <React.Fragment key={node.id}>
                      <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-center space-y-1 shadow-md">
                        <span className="text-[9px] text-indigo-400 font-mono block uppercase">{node.layer}</span>
                        <span className="font-bold text-slate-100 block">{node.label}</span>
                      </div>
                      {idx < lineage.nodes.length - 1 && (
                        <span className="text-indigo-400 font-bold font-mono">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: ETL/ELT Pipelines & Realtime Streaming */}
      {activeTab === 'pipelines' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-amber-500" />
                  <span>خطوط أنابيب التحويل والمزامنة اللحظية (ETL / ELT / CDC Pipelines)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  متابعة حالة التشغيل لخطوط أنابيب المزامنة التلقائية ومعدلات معالجة السجلات.
                </p>
              </div>
              <Button
                onClick={() => handleTriggerPipeline('dbt_curated_gold_warehouse_mart')}
                disabled={triggeringPipeline}
                className="bg-[#0F4C75] hover:bg-[#082F49] text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold"
              >
                {triggeringPipeline ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>تشغيل خط أنبوب دمج الـ DW</span>
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">اسم خط الأنبوب (Pipeline)</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">نظام المصدر</th>
                    <th className="p-3">الهدف النهائي</th>
                    <th className="p-3">السجلات المعالجة</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pipelines.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-extrabold text-slate-900">{p.pipelineName}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{p.type}</td>
                      <td className="p-3 text-slate-600">{p.sourceSystem}</td>
                      <td className="p-3 text-slate-600">{p.targetDestination}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{p.recordsProcessed.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            p.status === 'RUNNING'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Real-Time Event Streaming Telemetry */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>متابعة المواضيع الحية للبث المباشر (Kafka / MQTT Streaming Topics)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((top, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-black text-slate-900 block">{top.topic}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      المجموع اليومي: {top.totalToday.toLocaleString()} رسالة
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-xs font-black text-emerald-600 block">{top.msgPerSec} msg/sec</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-extrabold">
                      {top.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: Executive BI, Semantic Layer & Self-Service Analytics */}
      {activeTab === 'bi' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0F4C75]" />
                  <span>الطبقة الدلالية الموحدة ومحرك الاستعلام الاستراتيجي (Semantic Layer & Self-Service BI)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعاريف الأعمال الموحدة ومحرك بناء الاستعلامات المباشرة لإشراك المدراء دون الحاجة لمهارات تقنية.
                </p>
              </div>
            </div>

            {/* Semantic Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {semanticMetrics.map((met) => (
                <div key={met.metricId} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {met.category}
                  </span>
                  <h3 className="font-black text-xs text-slate-900">{met.nameAr}</h3>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {met.currentValue.toLocaleString()} {met.unit}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                    Eq: {met.formulaDefinition}
                  </p>
                </div>
              ))}
            </div>

            {/* Self-Service Analytics Query Builder */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>محرك باني التحليلات الذاتية (Self-Service Query Builder):</span>
              </h3>

              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={selectedMetricId}
                  onChange={(e) => setSelectedMetricId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 flex-1 outline-none"
                >
                  {semanticMetrics.map((m) => (
                    <option key={m.metricId} value={m.metricId}>
                      {m.nameAr} ({m.metricId})
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleRunSelfServiceQuery}
                  className="bg-[#0F4C75] hover:bg-[#082F49] text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shrink-0"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>توليد التقرير التحليلي</span>
                </Button>
              </div>

              {queryResult && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-black text-slate-900">نتيجة الاستعلام اللحظي: {queryResult.metricName}</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {queryResult.resultValue.toLocaleString()} {queryResult.unit}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">التوزيع حسب القطاعات التجارية:</span>
                    {queryResult.breakdown?.map((b: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-slate-800">
                        <span>{b.dimension}:</span>
                        <span className="font-mono font-bold">{Math.round(b.val).toLocaleString()} SAR</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: Governance & AI Data Foundation */}
      {activeTab === 'governance' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>سياسات حوكمة البيانات وبنية الذكاء الاصطناعي (Data Governance & AI Feature Store)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL) وضوابط الهيئة الوطنية للأمن السيبراني NCA.
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-mono">
              PDPL & SDAIA Compliant
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-sky-800 font-bold block">سياسة الحفظ والاحتفاظ</span>
              <h3 className="font-extrabold text-xs text-slate-900">الاحتفاظ بالسجلات المالية 10 سنوات</h3>
              <p className="text-[11px] text-slate-600">وفق متطلبات هيئة الزكاة والضريبة والجمارك ZATCA والقوانين التجارية.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-emerald-800 font-bold block">التشفير التام (Encryption)</span>
              <h3 className="font-extrabold text-xs text-slate-900">AES-256 at Rest & TLS 1.3 in Transit</h3>
              <p className="text-[11px] text-slate-600">تشفير كامل لقواعد البيانات والحسابات البنكية والسجلات الذهبية.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono text-indigo-800 font-bold block">متجر الميزات AI Feature Store</span>
              <h3 className="font-extrabold text-xs text-slate-900">مزامنة حية لنماذج التعلم الآلي ML</h3>
              <p className="text-[11px] text-slate-600">تغذية مستمرة لخوارزميات التنبؤ بالطرق والأسعار واختيار الناقل الملاحي.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
