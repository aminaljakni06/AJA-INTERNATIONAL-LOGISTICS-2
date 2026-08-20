/**
 * AJA INTERNATIONAL LOGISTICS — Controlled Parameterized Report Builder Modal
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 */

import React, { useState } from 'react';
import { X, FileText, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { analyticsMetricRegistry } from '../../lib/analytics/analyticsMetricRegistry';
import { CreateReportDefinitionPayload, ReportResourceDomain } from '../../types/reportFramework';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateReportDefinitionPayload) => Promise<void>;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({ isOpen, onClose, onSave }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [resource, setResource] = useState('shipments');
  const [domain, setDomain] = useState<ReportResourceDomain>('OPERATIONS');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const availableMetrics = analyticsMetricRegistry.listMetricsByResource(resource as any);

  const toggleMetric = (id: string) => {
    if (selectedMetrics.includes(id)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== id));
    } else {
      setSelectedMetrics([...selectedMetrics, id]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم التقرير باللغتين' : 'Please enter report title in both languages.');
      return;
    }
    if (selectedMetrics.length === 0) {
      setErrorMsg(isAr ? 'يرجى اختيار مؤشر أداء واحد على الأقل' : 'Please select at least one metric.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        resource,
        domain,
        metricIds: selectedMetrics as any,
        dimensions: selectedDimension ? [selectedDimension] : [],
        sections: [
          {
            id: `sec_kpi_${Date.now()}`,
            type: 'KPI_SUMMARY',
            titleEn: 'Report Summary KPIs',
            titleAr: 'ملخص مؤشرات التقرير',
            metricIds: selectedMetrics as any,
          },
          ...(selectedDimension
            ? [
                {
                  id: `sec_grouped_${Date.now()}`,
                  type: 'GROUPED_TABLE' as const,
                  titleEn: `Breakdown by ${selectedDimension}`,
                  titleAr: `التصنيف حسب ${selectedDimension}`,
                  dimension: selectedDimension,
                },
              ]
            : []),
        ],
        parameters: [
          {
            id: 'dateRange',
            nameEn: 'Evaluation Date Range',
            nameAr: 'فترة التقييم الزمنية',
            type: 'DATE_RANGE',
            targetFilterKey: 'dateRange',
          },
        ],
        outputFormats: ['PDF', 'CSV', 'XLSX'],
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save report definition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isAr ? 'بناء تقرير جديد مخصص' : 'Build Custom Parameterized Report'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                {isAr ? 'عنوان التقرير (English)' : 'Report Name (English)'} *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g., Executive Operations Report"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                {isAr ? 'عنوان التقرير (العربية)' : 'Report Name (Arabic)'} *
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: تقرير العمليات التشغيلية المباشر"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                {isAr ? 'المجال / المصدر الرئيسية' : 'Resource Domain'}
              </label>
              <select
                value={resource}
                onChange={(e) => {
                  setResource(e.target.value);
                  setSelectedMetrics([]);
                }}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="shipments">Shipments / Operational Logistics</option>
                <option value="customers">Customers / Commercial Accounts</option>
                <option value="quotes">Quotes / Sales Pipeline</option>
                <option value="finance">Finance / Billing & AR</option>
                <option value="control_tower">Control Tower & Exceptions</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                {isAr ? 'التصنيف الإداري' : 'Report Classification'}
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as ReportResourceDomain)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
                <option value="FINANCE">FINANCE</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="SALES">SALES</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
              {isAr ? 'اختر مؤشرات الأداء المعتمدة للتقرير' : 'Select Authorized Report Metrics'} *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900">
              {availableMetrics.map((metric) => {
                const isChecked = selectedMetrics.includes(metric.id);
                return (
                  <label
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${
                      isChecked
                        ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-blue-600' : 'text-gray-300'}`} />
                    <div>
                      <div className="font-bold">{isAr ? metric.labelAr : metric.labelEn}</div>
                      <div className="text-[10px] text-gray-400">{metric.id}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'إنشاء التقرير' : 'Create Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
