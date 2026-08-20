/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Parameterized Reporting Workspace
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Play,
  FileSpreadsheet,
  Calendar,
  Plus,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Download,
  Users,
  Building2,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ReportDefinition, ReportExecutionResult, ScheduledReportDefinition } from '../../types/reportFramework';
import { ReportsClient } from '../../services/reportsClient';
import { reportPdfGenerator } from '../../services/reports/reportPdfGenerator';
import { ReportBuilderModal } from './ReportBuilderModal';
import { exportToCsv } from '../../lib/exchange/csvExportEngine';

export const ReportsMainView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'templates' | 'execution' | 'schedules'>('templates');
  const [reportDefinitions, setReportDefinitions] = useState<ReportDefinition[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportDefinition[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [executionResult, setExecutionResult] = useState<ReportExecutionResult | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [scheduleRecipients, setScheduleRecipients] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const defs = await ReportsClient.getReportDefinitions();
      setReportDefinitions(defs);
      if (defs.length > 0 && !selectedReport) {
        setSelectedReport(defs[0]);
      }
      const scheds = await ReportsClient.getScheduledReports();
      setScheduledReports(scheds);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleExecuteReport = async (definition: ReportDefinition) => {
    setIsExecuting(true);
    setErrorMsg('');
    try {
      const result = await ReportsClient.executeReport(definition);

      setExecutionResult(result);
      setSelectedReport(definition);
      setActiveTab('execution');
    } catch (err: any) {
      setErrorMsg(err.message || 'Report execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!executionResult) return;
    try {
      await reportPdfGenerator.generateReportPdf(executionResult, isAr ? 'ar' : 'en');
    } catch (err: any) {
      alert(`PDF Export Failed: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    if (!executionResult) return;
    const records = Object.values(executionResult.metrics).map((m) => ({
      metricId: m.metricId,
      metricName: isAr ? m.labelAr : m.labelEn,
      value: m.value,
      formattedValue: m.formattedValue,
    }));

    exportToCsv(records, `${executionResult.reportTitleEn.replace(/\s+/g, '_')}_${executionResult.executionId}`);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await ReportsClient.createScheduledReport({
        reportDefinitionId: selectedReport.id,
        nameEn: scheduleName || `${selectedReport.nameEn} Schedule`,
        nameAr: scheduleName || `جدول ${selectedReport.nameAr}`,
        frequency: scheduleFreq,
        timeOfDay: '08:00',
        recipients: scheduleRecipients.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setIsScheduleModalOpen(false);
      loadReportsData();
    } catch (err: any) {
      alert(`Failed to create schedule: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? 'منصة التقارير التنفيذية والمعلمية' : 'Parameterized Report Builder & Execution Platform'}</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
                STEP 05.19.10
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isAr
                ? 'إصدار التقارير التنفيذية المعتمدة، مستندات PDF المنسقة، وجدولة تسليم التقارير'
                : 'Enterprise report definitions, PDF summary generation, and scheduled reporting governance'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء تقرير مخصص' : 'Build Custom Report'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isAr ? 'دليل التقارير وقوالب النظام' : 'Report Templates & Definitions'}</span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px]">
            {reportDefinitions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'execution'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{isAr ? 'معاينة وتشغيل التقرير الحاي' : 'Live Execution & PDF Preview'}</span>
          {executionResult && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'schedules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isAr ? 'جدولة التقارير الآلية' : 'Scheduled Report Jobs'}</span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px]">
            {scheduledReports.length}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 text-xs rounded-2xl flex items-center gap-2 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Templates & Definitions */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportDefinitions.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    {report.domain}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{report.id}</span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {isAr ? report.nameAr : report.nameEn}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {isAr ? report.descriptionAr : report.descriptionEn}
                </p>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1">
                  {report.metricIds.map((m) => (
                    <span key={m} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleExecuteReport(report)}
                  disabled={isExecuting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تشغيل الآن' : 'Execute Report'}</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(report);
                    setIsScheduleModalOpen(true);
                  }}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title={isAr ? 'جدولة هذا التقرير' : 'Schedule Report'}
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Execution & Preview */}
      {activeTab === 'execution' && (
        <div className="space-y-6">
          {executionResult ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6 shadow-sm">
              {/* Report Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'مستند معتمد من المحرك المباشر' : 'Server-Authoritative Execution Result'}</span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {isAr ? executionResult.reportTitleAr : executionResult.reportTitleEn}
                  </h2>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                    <span>ID: {executionResult.executionId}</span>
                    <span>•</span>
                    <span>{new Date(executionResult.generatedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{executionResult.executionTimeMs} ms</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
                  </button>
                  <button
                    onClick={handleGeneratePdf}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isAr ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  {isAr ? 'مؤشرات التقرير المعتمدة' : 'Report Executive Metrics'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.values(executionResult.metrics).map((m) => (
                    <div
                      key={m.metricId}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1"
                    >
                      <span className="text-xs text-gray-500">{isAr ? m.labelAr : m.labelEn}</span>
                      <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {m.formattedValue}
                      </p>
                      <span className="text-[10px] text-gray-400 font-mono">{m.metricId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grouped Results */}
              {Object.values(executionResult.groupedResults).map((grouped) => (
                <div key={grouped.dimension} className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {isAr ? `التصنيف المجمع: ${grouped.dimension}` : `Grouped Analysis: ${grouped.dimension}`}
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
                        <tr>
                          <th className="px-4 py-2.5">{isAr ? 'الفئة' : 'Category'}</th>
                          <th className="px-4 py-2.5 text-center">{isAr ? 'العدد' : 'Count'}</th>
                          <th className="px-4 py-2.5 text-right">{isAr ? 'المجموع' : 'Value'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.groups.map((g) => (
                          <tr key={g.key} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">
                              {isAr ? g.labelAr : g.labelEn}
                            </td>
                            <td className="px-4 py-2 text-center">{g.count}</td>
                            <td className="px-4 py-2 text-right font-extrabold text-blue-600">
                              {g.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
              <Play className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-700 dark:text-gray-300">
                {isAr ? 'لم يتم تشغيل تقرير بعد' : 'No Report Execution Active'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {isAr
                  ? 'اختر تقريراً من تبويب قوالب النظام وانقر على "تشغيل الآن" لمعاينة البيانات وإصدار PDF'
                  : 'Select a report definition from the templates tab and click "Execute Report" to generate live preview and export PDF.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Schedules */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledReports.map((sch) => (
              <div
                key={sch.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                    {sch.frequency}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{sch.id}</span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {isAr ? sch.nameAr : sch.nameEn}
                </h3>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <strong>{isAr ? 'التوقيت' : 'Time'}:</strong> {sch.timeOfDay} ({sch.timezone})
                  </div>
                  <div>
                    <strong>{isAr ? 'المستلمون' : 'Recipients'}:</strong> {sch.recipients.join(', ') || 'In-App Center'}
                  </div>
                  <div>
                    <strong>{isAr ? 'حالة التجديد' : 'Status'}:</strong>{' '}
                    <span className="text-amber-600 font-bold">{sch.lastStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Builder Modal */}
      <ReportBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSave={async (payload) => {
          await ReportsClient.createReportDefinition(payload);
          loadReportsData();
        }}
      />

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {isAr ? `جدولة تقرير: ${selectedReport.nameAr}` : `Schedule Report: ${selectedReport.nameEn}`}
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  {isAr ? 'اسم التكرار' : 'Schedule Title'}
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="Daily Executive Dispatch"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  {isAr ? 'معدل التكرار' : 'Recurrence Frequency'}
                </label>
                <select
                  value={scheduleFreq}
                  onChange={(e) => setScheduleFreq(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <option value="DAILY">DAILY</option>
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  {isAr ? 'بريد المستلمين (مفصولة بفاصلة)' : 'Recipients Email (comma separated)'}
                </label>
                <input
                  type="text"
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  placeholder="exec@ajalogistics.com, ops@ajalogistics.com"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  {isAr ? 'حفظ الجدولة' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
