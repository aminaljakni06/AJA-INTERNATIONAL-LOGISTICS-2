import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  Building2,
  DollarSign,
  History,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { Proposal } from '../../types/sales';

interface ProposalManagerProps {
  proposals: Proposal[];
  loading: boolean;
  onRefresh: () => void;
  onSaveProposal: (proposal: Partial<Proposal>) => Promise<void>;
}

export const ProposalManager: React.FC<ProposalManagerProps> = ({
  proposals,
  loading,
  onRefresh,
  onSaveProposal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  // Proposal Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [opportunityName, setOpportunityName] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [totalAmount, setTotalAmount] = useState(450000);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [saving, setSaving] = useState(false);

  const openNewProposalModal = () => {
    setSelectedProposal(null);
    setTitle('عرض الخدمات اللوجستية المتكاملة وحل الشحن الدولي والتخليص الجمركي');
    setCustomerName('شركة السيف اللوجستية');
    setOpportunityName('عقد توريد وشحن خطوط إنتاج السيارات الكهربائية - نيوم');
    setExecutiveSummary(
      'تلتزم شركة أجا اللوجستية بتقديم خدمات شحن وتخليص مينائي فائقة السرعة بضمان موثوقية 99.8% مع تتبع تفاعلي بالأقمار الصناعية.'
    );
    setScopeOfWork(
      'توفير 150 حاوية 40 قدم، التخليص الجمركي الفوري بميناء جبل علي وميناء نيوم، إضافة للخدمات اللوجستية والتخزين في المناطق الحرة.'
    );
    setTotalAmount(4800000);
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProposal({
        id: selectedProposal?.id,
        title,
        customerName,
        opportunityName,
        executiveSummary,
        scopeOfWork,
        totalAmount: Number(totalAmount),
        validUntil,
        digitalApprovalStatus: 'PENDING_APPROVAL',
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
        <div>
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#EA580C]" />
            <span>منصة العروض الفنية والمالية (Enterprise Proposal Center)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة نماذج العروض الفنية، إصدار العروض، وإدارة التوقيع والاعتماد الرقمي
          </p>
        </div>

        <Button onClick={openNewProposalModal} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>إنشاء عرض سعر جديد</span>
        </Button>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposals.map(prop => (
          <Card key={prop.id} className="p-4 bg-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded border border-[#EA580C]/20">
                  {prop.proposalNumber} (v{prop.version})
                </span>
                <h4 className="font-bold text-sm text-slate-100 mt-1 line-clamp-1">{prop.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{prop.customerName}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 bg-slate-800/80 p-2 rounded border border-slate-700/60">
              {prop.executiveSummary}
            </p>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">القيمة الإجمالية:</span>
              <span className="font-bold text-[#EA580C]">{prop.totalAmount.toLocaleString()} SAR</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  prop.digitalApprovalStatus === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : prop.digitalApprovalStatus === 'PENDING_APPROVAL'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {prop.digitalApprovalStatus === 'APPROVED'
                  ? 'معتمد رقمياً'
                  : prop.digitalApprovalStatus === 'PENDING_APPROVAL'
                  ? 'قيد مراجعة الاعتماد'
                  : prop.digitalApprovalStatus}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewProposal(prop)}
                className="text-xs px-2.5 py-1 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة العرض</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* NEW PROPOSAL MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء عرض سعر وفني جديد">
        <form onSubmit={handleSaveSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان العرض الفني والمالي *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم العميل *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الفرصة البيعية المرتبطة</label>
              <input
                type="text"
                value={opportunityName}
                onChange={e => setOpportunityName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الملخص التنفيذي (Executive Summary)</label>
            <textarea
              rows={2}
              value={executiveSummary}
              onChange={e => setExecutiveSummary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">نطاق العمل اللوجستي (Scope of Work)</label>
            <textarea
              rows={3}
              value={scopeOfWork}
              onChange={e => setScopeOfWork(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">القيمة الإجمالية للعرض (SAR) *</label>
              <input
                type="number"
                value={totalAmount}
                onChange={e => setTotalAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ صلاحية العرض *</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold">
              {saving ? 'جاري الإصدار...' : 'إصدار العرض الفني والمالي'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* PREVIEW PROPOSAL MODAL */}
      {previewProposal && (
        <Modal
          isOpen={Boolean(previewProposal)}
          onClose={() => setPreviewProposal(null)}
          title={`معاينة العرض: ${previewProposal.proposalNumber}`}
        >
          <div className="space-y-4 text-right text-sm">
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#EA580C] text-base">{previewProposal.title}</span>
                <span className="font-mono text-xs text-slate-400">الإصدار {previewProposal.version}</span>
              </div>
              <p className="text-xs text-slate-300">العميل: {previewProposal.customerName}</p>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-200 mb-1">الملخص التنفيذي</h5>
              <p className="text-xs text-slate-300 bg-slate-800 p-3 rounded border border-slate-700">
                {previewProposal.executiveSummary}
              </p>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-200 mb-1">نطاق العمل والتسليم اللوجستي</h5>
              <p className="text-xs text-slate-300 bg-slate-800 p-3 rounded border border-slate-700">
                {previewProposal.scopeOfWork}
              </p>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">إجمالي قيمة العرض الكلية:</span>
              <span className="font-bold text-[#EA580C] text-base">
                {previewProposal.totalAmount.toLocaleString()} SAR
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setPreviewProposal(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
