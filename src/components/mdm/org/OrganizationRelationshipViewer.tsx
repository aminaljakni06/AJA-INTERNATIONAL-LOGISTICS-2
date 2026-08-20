import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Network, 
  GitMerge, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  Share2
} from 'lucide-react';
import { OrganizationRelationship, MasterOrganizationNode, OrgRelationshipType } from '../../../types/organizationMaster';

export const OrganizationRelationshipViewer: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [relationships, setRelationships] = useState<OrganizationRelationship[]>([]);
  const [nodes, setNodes] = useState<MasterOrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);

  // New relationship modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceOrgId, setSourceOrgId] = useState('');
  const [targetOrgId, setTargetOrgId] = useState('');
  const [relationshipType, setRelationshipType] = useState<OrgRelationshipType>('SHARED_SERVICES');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const [resRel, resNodes] = await Promise.all([
        fetch('/api/organization/master/relationships', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/organization/master/nodes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resRel.ok && resNodes.ok) {
        setRelationships(await resRel.json());
        setNodes(await resNodes.json());
      }
    } catch (err) {
      console.error('[RelationshipViewer] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceOrgId || !targetOrgId || sourceOrgId === targetOrgId) {
      alert(isAr ? 'يرجى اختيار كيانين مختلفين لإنشاء العلاقة' : 'Please select two different organization entities.');
      return;
    }

    const sourceNode = nodes.find(n => n.id === sourceOrgId);
    const targetNode = nodes.find(n => n.id === targetOrgId);

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/organization/master/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sourceOrgId,
          sourceOrgName: isAr ? sourceNode?.nameAr || sourceNode?.name : sourceNode?.name,
          targetOrgId,
          targetOrgName: isAr ? targetNode?.nameAr || targetNode?.name : targetNode?.name,
          relationshipType,
          description,
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE'
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSourceOrgId('');
        setTargetOrgId('');
        setDescription('');
        fetchData();
      }
    } catch (err) {
      console.error('[CreateRelationship] Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRelBadge = (type: OrgRelationshipType) => {
    const config: Record<string, { bg: string; text: string; labelEn: string; labelAr: string }> = {
      PARENT_CHILD: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', labelEn: 'Parent-Subsidiary', labelAr: 'تبعية هرمية' },
      SHARED_SERVICES: { bg: 'bg-sky-100 border-sky-300', text: 'text-sky-800', labelEn: 'Shared Services', labelAr: 'خدمات مشتركة' },
      INTERNAL_SUPPLIER: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', labelEn: 'Internal Supplier', labelAr: 'مورد داخلي' },
      INTERNAL_CUSTOMER: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', labelEn: 'Internal Customer', labelAr: 'عميل داخلي' },
      CROSS_COMPANY: { bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-800', labelEn: 'Cross Company Alliance', labelAr: 'تحالف بين شركات' }
    };
    const cfg = config[type] || { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', labelEn: type, labelAr: type };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${cfg.bg} ${cfg.text}`}>
        {isAr ? cfg.labelAr : cfg.labelEn}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-500" />
            <span>{isAr ? 'علاقات الكيانات التنظيمية والخدمات المشتركة' : 'Cross-Entity Relationships & Shared Services Matrix'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? 'تحديد وإدارة العلاقات التبادلية بين الشركات، مراكز الخدمات المشتركة والتوريد الداخلي عبر كافة الفروع.'
              : 'Governance of inter-company relationships, shared services centers, and internal supplier/customer workflows.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm text-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'علاقة تنظيمية جديدة' : 'New Org Relationship'}</span>
        </button>
      </div>

      {/* Relationships Cards List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري تحميل شبكة العلاقات التنظيمية...' : 'Loading Organization Relationships...'}
        </div>
      ) : relationships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          {isAr ? 'لا توجد علاقات تنظيمية مسجلة.' : 'No cross-entity relationships defined.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {relationships.map(rel => (
            <div key={rel.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                {getRelBadge(rel.relationshipType)}
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {rel.status}
                </span>
              </div>

              {/* Source -> Target mapping */}
              <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="space-y-0.5 flex-1">
                  <span className="text-[10px] text-slate-400 font-medium block">{isAr ? 'الكيان المصدر' : 'Source Entity'}</span>
                  <p className="font-black text-slate-900 leading-snug">{rel.sourceOrgName}</p>
                </div>

                <div className="p-2 bg-amber-100 text-amber-800 rounded-full shrink-0">
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </div>

                <div className="space-y-0.5 flex-1 text-right rtl:text-left">
                  <span className="text-[10px] text-slate-400 font-medium block">{isAr ? 'الكيان المستهدف' : 'Target Entity'}</span>
                  <p className="font-black text-slate-900 leading-snug">{rel.targetOrgName}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">{rel.description}</p>

              <div className="pt-2 text-[10px] text-slate-400 font-mono">
                {isAr ? `تاريخ البدء: ${rel.effectiveDate}` : `Effective Since: ${rel.effectiveDate}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Relationship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? 'تعريف علاقة بين كيانين تنظيميين' : 'Create Cross-Entity Relationship'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'ربط شركتين أو فرعين بعلاقة توريد داخلي أو خدمات مشتركة.' : 'Link two organization nodes with shared services or internal supply relations.'}
              </p>
            </div>

            <form onSubmit={handleCreateRelationship} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الكيان المصدر (المزود)' : 'Source Entity (Provider)'}</label>
                <select
                  value={sourceOrgId}
                  onChange={e => setSourceOrgId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">{isAr ? '-- اختر الكيان المصدر --' : '-- Select Source Node --'}</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.code}] {isAr ? n.nameAr : n.name} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'الكيان المستهدف (المستفيد)' : 'Target Entity (Beneficiary)'}</label>
                <select
                  value={targetOrgId}
                  onChange={e => setTargetOrgId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">{isAr ? '-- اختر الكيان المستهدف --' : '-- Select Target Node --'}</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.code}] {isAr ? n.nameAr : n.name} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'نوع العلاقة التنظيمية' : 'Relationship Type'}</label>
                <select
                  value={relationshipType}
                  onChange={e => setRelationshipType(e.target.value as OrgRelationshipType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="SHARED_SERVICES">{isAr ? 'مركز خدمات مشتركة (Shared Services)' : 'Shared Services'}</option>
                  <option value="INTERNAL_SUPPLIER">{isAr ? 'مورد داخلي للخدمات والعمليات' : 'Internal Supplier'}</option>
                  <option value="INTERNAL_CUSTOMER">{isAr ? 'عميل داخلي' : 'Internal Customer'}</option>
                  <option value="CROSS_COMPANY">{isAr ? 'تحالف بين شركات المجموعة' : 'Cross Company Alliance'}</option>
                  <option value="TEMPORARY_ASSIGNMENT">{isAr ? 'تكليف مؤقت' : 'Temporary Assignment'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isAr ? 'وصف نطاق العلاقة والمسؤولية' : 'Relationship Scope Description'}</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder={isAr ? 'أدخل تفاصيل الخدمات المتبادلة المعتمدة...' : 'Enter agreed cross-services details...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'إنشاء العلاقة' : 'Create Relationship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
