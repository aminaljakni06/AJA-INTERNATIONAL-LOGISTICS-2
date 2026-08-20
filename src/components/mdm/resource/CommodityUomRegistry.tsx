import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Calculator, Loader2, Plus, Power, Save, Trash2 } from 'lucide-react';
import { UomRecord, CommodityRecord, HazmatRegulationClass, UomCategory } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';
import { formatProductResourceValidationMessage, validateProductResourcePayload } from '../../../utils/productResourceValidators';

const UOM_CATEGORIES: UomCategory[] = ['LENGTH', 'WEIGHT', 'VOLUME', 'AREA', 'TIME', 'QUANTITY'];
const HAZMAT_CLASSES: HazmatRegulationClass[] = ['NONE', 'IMDG', 'ADR', 'IATA_DGR', 'LITHIUM_BATTERIES', 'FOOD', 'MEDICAL', 'CHEMICAL', 'INDUSTRIAL'];

export const CommodityUomRegistry: React.FC = () => {
  const { language } = useLanguage();
  const { confirmAction } = useEnterpriseConfirmation();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const isAr = language === 'ar';

  const [uoms, setUoms] = useState<UomRecord[]>([]);
  const [commodities, setCommodities] = useState<CommodityRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'COMMODITIES' | 'UOM'>('COMMODITIES');

  // UOM Live Converter State
  const [convertVal, setConvertVal] = useState<number>(1);
  const [fromUom, setFromUom] = useState('TON');
  const [toUom, setToUom] = useState('KG');
  const [convertResult, setConvertResult] = useState<{ resultValue: number; formula: string } | null>(null);
  const [busyResourceId, setBusyResourceId] = useState<string | null>(null);
  const [showCommodityForm, setShowCommodityForm] = useState(false);
  const [showUomForm, setShowUomForm] = useState(false);
  const [newCommodity, setNewCommodity] = useState({
    hsCode: '',
    unNumber: '',
    hazmatClass: 'NONE' as HazmatRegulationClass,
    titleAr: '',
    titleEn: '',
    categoryName: '',
    importDutyRatePercent: 0,
    vatRatePercent: 15,
    isRestrictedImport: false,
    requiresSpecialPermit: false,
    specialPermitAgencyAr: '',
    specialPermitAgencyEn: '',
  });
  const [newUom, setNewUom] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    category: 'QUANTITY' as UomCategory,
    isBaseUnit: false,
    conversionFactorToBase: 1,
  });

  const loadData = async () => {
    const uList = await ProductResourceMasterService.getUoms();
    const cList = await ProductResourceMasterService.getCommodities();
    setUoms(uList);
    setCommodities(cList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCommodityStatus = async (commodity: CommodityRecord) => {
    const busyKey = `commodity:${commodity.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = commodity.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateCommodity(commodity.id, { status: nextStatus });
      toastSuccess('Commodity status updated', 'تم تحديث حالة السلعة', `${commodity.hsCode}: ${nextStatus}`, `${commodity.hsCode}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update commodity status';
      toastError('Commodity status failed', 'فشل تحديث حالة السلعة', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleCreateCommodity = async () => {
    if (busyResourceId) return;
    const payload = {
      ...newCommodity,
      unNumber: newCommodity.unNumber.trim() || undefined,
      specialPermitAgencyAr: newCommodity.specialPermitAgencyAr.trim() || undefined,
      specialPermitAgencyEn: newCommodity.specialPermitAgencyEn.trim() || undefined,
      status: 'ACTIVE' as const,
    };
    const validation = validateProductResourcePayload('commodity', payload, 'create');

    if (!validation.valid) {
      const message = formatProductResourceValidationMessage(validation, language);
      toastError('Invalid commodity', 'بيانات السلعة غير صحيحة', message, message);
      return;
    }

    setBusyResourceId('commodity:create');
    try {
      const created = await ProductResourceMasterService.createCommodity(payload);
      toastSuccess('Commodity created', 'تم إنشاء السلعة', created.hsCode, created.hsCode);
      setNewCommodity({
        hsCode: '',
        unNumber: '',
        hazmatClass: 'NONE',
        titleAr: '',
        titleEn: '',
        categoryName: '',
        importDutyRatePercent: 0,
        vatRatePercent: 15,
        isRestrictedImport: false,
        requiresSpecialPermit: false,
        specialPermitAgencyAr: '',
        specialPermitAgencyEn: '',
      });
      setShowCommodityForm(false);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create commodity';
      toastError('Commodity create failed', 'فشل إنشاء السلعة', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteCommodity = async (commodity: CommodityRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete commodity',
      titleAr: 'حذف السلعة',
      messageEn: `Delete commodity ${commodity.hsCode}? This action cannot be undone.`,
      messageAr: `هل تريد حذف السلعة ${commodity.hsCode}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`commodity:${commodity.id}`);
        try {
          await ProductResourceMasterService.deleteCommodity(commodity.id);
          toastSuccess('Commodity deleted', 'تم حذف السلعة', commodity.hsCode, commodity.hsCode);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete commodity';
          toastError('Commodity delete failed', 'فشل حذف السلعة', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  const handleToggleUomStatus = async (uom: UomRecord) => {
    const busyKey = `uom:${uom.id}`;
    if (busyResourceId) return;
    setBusyResourceId(busyKey);
    try {
      const nextStatus = uom.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateUom(uom.id, { status: nextStatus });
      toastSuccess('UOM status updated', 'تم تحديث حالة وحدة القياس', `${uom.code}: ${nextStatus}`, `${uom.code}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update UOM status';
      toastError('UOM status failed', 'فشل تحديث حالة وحدة القياس', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleCreateUom = async () => {
    if (busyResourceId) return;
    const payload = {
      ...newUom,
      code: newUom.code.trim().toUpperCase(),
      status: 'ACTIVE' as const,
    };
    const validation = validateProductResourcePayload('uom', payload, 'create');

    if (!validation.valid) {
      const message = formatProductResourceValidationMessage(validation, language);
      toastError('Invalid UOM', 'بيانات وحدة القياس غير صحيحة', message, message);
      return;
    }

    setBusyResourceId('uom:create');
    try {
      const created = await ProductResourceMasterService.createUom(payload);
      toastSuccess('UOM created', 'تم إنشاء وحدة القياس', created.code, created.code);
      setNewUom({
        code: '',
        nameAr: '',
        nameEn: '',
        category: 'QUANTITY',
        isBaseUnit: false,
        conversionFactorToBase: 1,
      });
      setShowUomForm(false);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create UOM';
      toastError('UOM create failed', 'فشل إنشاء وحدة القياس', message, message);
    } finally {
      setBusyResourceId(null);
    }
  };

  const handleDeleteUom = async (uom: UomRecord) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete UOM',
      titleAr: 'حذف وحدة القياس',
      messageEn: `Delete UOM ${uom.code}? This action cannot be undone.`,
      messageAr: `هل تريد حذف وحدة القياس ${uom.code}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyResourceId(`uom:${uom.id}`);
        try {
          await ProductResourceMasterService.deleteUom(uom.id);
          toastSuccess('UOM deleted', 'تم حذف وحدة القياس', uom.code, uom.code);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete UOM';
          toastError('UOM delete failed', 'فشل حذف وحدة القياس', message, message);
        } finally {
          setBusyResourceId(null);
        }
      }
    });
  };

  useEffect(() => {
    let cancelled = false;

    if (fromUom && toUom) {
      ProductResourceMasterService.convertUomValue(convertVal, fromUom, toUom)
        .then(res => {
          if (!cancelled) setConvertResult(res);
        })
        .catch(() => {
          if (!cancelled) {
            setConvertResult({ resultValue: convertVal, formula: 'Conversion unavailable' });
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [convertVal, fromUom, toUom, uoms]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isAr ? 'تصنيفات السلع ووحدات القياس التلقائية (Commodity & Live UOM Conversion Matrix)' : 'Commodity Master & Live UOM Conversion Matrix'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'التعريف الجمركي الدولي HS Codes، تنظيرات المواد الخطرة UN، وحاسبة التحويل التلقائي بين وحدات القياس (KG, TON, CBM, LB)'
              : 'HS customs tariff registry, UN hazmat classes, and live mathematical unit conversion matrix calculator'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('COMMODITIES')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'COMMODITIES' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'سجل السلع والجمارك HS' : 'Commodity & HS Codes'} ({commodities.length})
          </button>

          <button
            onClick={() => setActiveTab('UOM')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'UOM' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'وحدات القياس ومصفوفة التحويل' : 'UOMs & Matrix'} ({uoms.length})
          </button>
        </div>
      </div>

      {activeTab === 'COMMODITIES' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setShowCommodityForm(value => !value)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'إضافة سلعة' : 'Add Commodity'}
            </button>

            {showCommodityForm && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <input
                  value={newCommodity.hsCode}
                  onChange={e => setNewCommodity({ ...newCommodity, hsCode: e.target.value })}
                  placeholder={isAr ? 'رمز HS' : 'HS code'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  value={newCommodity.titleEn}
                  onChange={e => setNewCommodity({ ...newCommodity, titleEn: e.target.value })}
                  placeholder={isAr ? 'الاسم بالإنجليزية' : 'English title'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  value={newCommodity.titleAr}
                  onChange={e => setNewCommodity({ ...newCommodity, titleAr: e.target.value })}
                  placeholder={isAr ? 'الاسم بالعربية' : 'Arabic title'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  value={newCommodity.categoryName}
                  onChange={e => setNewCommodity({ ...newCommodity, categoryName: e.target.value })}
                  placeholder={isAr ? 'التصنيف' : 'Category'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <select
                  value={newCommodity.hazmatClass}
                  onChange={e => setNewCommodity({ ...newCommodity, hazmatClass: e.target.value as HazmatRegulationClass })}
                  className="p-2.5 rounded-xl border border-slate-200"
                >
                  {HAZMAT_CLASSES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <input
                  type="number"
                  value={newCommodity.importDutyRatePercent}
                  onChange={e => setNewCommodity({ ...newCommodity, importDutyRatePercent: Number(e.target.value) })}
                  placeholder={isAr ? 'رسوم الجمارك %' : 'Import duty %'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="number"
                  value={newCommodity.vatRatePercent}
                  onChange={e => setNewCommodity({ ...newCommodity, vatRatePercent: Number(e.target.value) })}
                  placeholder={isAr ? 'ضريبة القيمة %' : 'VAT %'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleCreateCommodity}
                  disabled={busyResourceId !== null}
                  className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black disabled:opacity-50"
                >
                  {busyResourceId === 'commodity:create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isAr ? 'حفظ' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commodities.map(c => (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 hover:border-amber-500 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">
                      HS Code: {c.hsCode}
                    </span>
                    {c.unNumber && (
                      <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded ml-2">
                        {c.unNumber}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm mt-2">{isAr ? c.titleAr : c.titleEn}</h3>
                    <div className="text-slate-400 text-xs">Category: {c.categoryName} | Hazmat: {c.hazmatClass}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCommodityStatus(c)}
                      disabled={busyResourceId !== null}
                      className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-50"
                      title={isAr ? 'تغيير الحالة' : 'Toggle status'}
                    >
                      {busyResourceId === `commodity:${c.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommodity(c)}
                      disabled={busyResourceId !== null}
                      className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title={isAr ? 'حذف السلعة' : 'Delete commodity'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block">{isAr ? 'رسوم الجمارك:' : 'Import Duty:'}</span>
                    <span className="font-bold text-slate-900">{c.importDutyRatePercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? 'ضريبة القيمة المضافة:' : 'VAT Rate:'}</span>
                    <span className="font-bold text-slate-900">{c.vatRatePercent}%</span>
                  </div>
                </div>

                {c.requiresSpecialPermit && (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold">{isAr ? 'جهة التصريح المطلوب:' : 'Permit Agency:'}</span> {isAr ? c.specialPermitAgencyAr : c.specialPermitAgencyEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setShowUomForm(value => !value)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              {isAr ? 'إضافة وحدة قياس' : 'Add UOM'}
            </button>

            {showUomForm && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                <input
                  value={newUom.code}
                  onChange={e => setNewUom({ ...newUom, code: e.target.value })}
                  placeholder={isAr ? 'الرمز' : 'Code'}
                  className="p-2.5 rounded-xl border border-slate-200 uppercase"
                />
                <input
                  value={newUom.nameEn}
                  onChange={e => setNewUom({ ...newUom, nameEn: e.target.value })}
                  placeholder={isAr ? 'الاسم بالإنجليزية' : 'English name'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <input
                  value={newUom.nameAr}
                  onChange={e => setNewUom({ ...newUom, nameAr: e.target.value })}
                  placeholder={isAr ? 'الاسم بالعربية' : 'Arabic name'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <select
                  value={newUom.category}
                  onChange={e => setNewUom({ ...newUom, category: e.target.value as UomCategory })}
                  className="p-2.5 rounded-xl border border-slate-200"
                >
                  {UOM_CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <input
                  type="number"
                  value={newUom.conversionFactorToBase}
                  onChange={e => setNewUom({ ...newUom, conversionFactorToBase: Number(e.target.value) })}
                  placeholder={isAr ? 'معامل التحويل' : 'Factor'}
                  className="p-2.5 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleCreateUom}
                  disabled={busyResourceId !== null}
                  className="inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600 text-white font-black disabled:opacity-50"
                >
                  {busyResourceId === 'uom:create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isAr ? 'حفظ' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Interactive Live Converter Box */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Calculator className="w-5 h-5" />
              <span>{isAr ? 'حاسبة التحويل التلقائي الآلية بين الوحدات' : 'Automatic UOM Mathematical Conversion Matrix Engine'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs items-end">
              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'القيمة' : 'Quantity Value'}</label>
                <input
                  type="number"
                  value={convertVal}
                  onChange={e => setConvertVal(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'من وحدة' : 'From UOM'}</label>
                <select
                  value={fromUom}
                  onChange={e => setFromUom(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                >
                  {uoms.map(u => (
                    <option key={u.id} value={u.code}>{u.code} - {isAr ? u.nameAr : u.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{isAr ? 'إلى وحدة' : 'To UOM'}</label>
                <select
                  value={toUom}
                  onChange={e => setToUom(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                >
                  {uoms.map(u => (
                    <option key={u.id} value={u.code}>{u.code} - {isAr ? u.nameAr : u.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400">{isAr ? 'النتيجة المحسوبة:' : 'Converted Output:'}</span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {convertResult ? convertResult.resultValue.toFixed(4) : convertVal} {toUom}
                </span>
              </div>
            </div>

            {convertResult && (
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                Formula: {convertResult.formula}
              </div>
            )}
          </div>

          {/* UOM List Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {uoms.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {u.code}
                  </span>
                  {u.isBaseUnit && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      BASE
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1">{isAr ? u.nameAr : u.nameEn}</h4>
                <div className="text-[11px] text-slate-400">{u.category} Category</div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500">{u.status}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleUomStatus(u)}
                      disabled={busyResourceId !== null}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-50"
                      title={isAr ? 'تغيير الحالة' : 'Toggle status'}
                    >
                      {busyResourceId === `uom:${u.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUom(u)}
                      disabled={busyResourceId !== null}
                      className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title={isAr ? 'حذف وحدة القياس' : 'Delete UOM'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
