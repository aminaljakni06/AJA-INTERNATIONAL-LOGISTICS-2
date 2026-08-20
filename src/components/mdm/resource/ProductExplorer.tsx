import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Package, Plus, QrCode, Tag, ShieldAlert, CheckCircle2, Search, Filter, Layers, Barcode, Box, Power, Trash2, Edit3, Loader2 } from 'lucide-react';
import { ProductMaster } from '../../../types/productResourceMaster';
import { ProductResourceMasterClient as ProductResourceMasterService } from '../../../services/productResourceMasterClient';
import { useEnterpriseToast } from '../../../hooks/useEnterpriseToast';
import { useEnterpriseConfirmation } from '../../../hooks/useEnterpriseConfirmation';
import { formatProductResourceValidationMessage, validateProductResourcePayload } from '../../../utils/productResourceValidators';

export const ProductExplorer: React.FC = () => {
  const { language } = useLanguage();
  const { toastSuccess, toastError } = useEnterpriseToast();
  const { confirmAction } = useEnterpriseConfirmation();
  const isAr = language === 'ar';

  const [products, setProducts] = useState<ProductMaster[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // New Product Form State
  const [sku, setSku] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [hsCode, setHsCode] = useState('9031.80.90');
  const [category, setCategory] = useState('INDUSTRIAL_ELECTRONICS');
  const [brand, setBrand] = useState('AJA TechSense');
  const [uom, setUom] = useState('PCS');
  const [weightKg, setWeightKg] = useState(1.2);
  const [isHazmat, setIsHazmat] = useState(false);
  const [unNumber, setUnNumber] = useState('');

  const loadData = async () => {
    const list = await ProductResourceMasterService.getProducts();
    setProducts(list);
  };

  const resetForm = () => {
    setSku('');
    setNameAr('');
    setNameEn('');
    setBarcode('');
    setHsCode('9031.80.90');
    setCategory('INDUSTRIAL_ELECTRONICS');
    setBrand('AJA TechSense');
    setUom('PCS');
    setWeightKg(1.2);
    setIsHazmat(false);
    setUnNumber('');
    setEditingProduct(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsAdding(true);
  };

  const openEditForm = (product: ProductMaster) => {
    setEditingProduct(product);
    setSku(product.sku);
    setNameAr(product.nameAr);
    setNameEn(product.nameEn);
    setBarcode(product.barcode);
    setHsCode(product.hsCode);
    setCategory(product.commodityCategory);
    setBrand(product.brand);
    setUom(product.uom);
    setWeightKg(product.weightKg);
    setIsHazmat(product.isHazmat);
    setUnNumber(product.unNumber || '');
    setIsAdding(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !nameEn || !nameAr || isSavingProduct) return;

    const cleanBarcode = barcode.trim();
    const validation = validateProductResourcePayload(
      'product',
      { barcode: cleanBarcode, weightKg },
      editingProduct ? 'update' : 'create'
    );
    if (!validation.valid) {
      toastError(
        'Invalid product data',
        'بيانات المنتج غير صالحة',
        formatProductResourceValidationMessage(validation, 'en'),
        formatProductResourceValidationMessage(validation, 'ar')
      );
      return;
    }

    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        await ProductResourceMasterService.updateProduct(
          editingProduct.id,
          {
            barcode: cleanBarcode,
            nameAr,
            nameEn,
            commodityCategory: category,
            hsCode,
            brand,
            uom,
            weightKg,
            isHazmat,
            unNumber: isHazmat ? unNumber || 'UN1993' : undefined
          },
          'admin'
        );

        toastSuccess('Product updated', 'تم تحديث المنتج', sku, sku);
      } else {
        await ProductResourceMasterService.createProduct(
          {
            globalProductId: `G-${sku}`,
            productCode: sku,
            sku,
            barcode: cleanBarcode || '6281100' + Math.floor(100000 + Math.random() * 900000),
            qrCode: `AJA-QR-${sku}`,
            rfidTag: `RFID-${sku}`,
            nameAr,
            nameEn,
            commodityCategory: category,
            hsCode,
            brand,
            model: '2026-X',
            countryOfOrigin: 'SA',
            uom,
            weightKg,
            volumeCbm: 0.01,
            dimensionsCm: { length: 20, width: 15, height: 10 },
            packagingType: 'BOX',
            temperatureClass: 'AMBIENT',
            isHazmat,
            unNumber: isHazmat ? unNumber || 'UN1993' : undefined,
            status: 'ACTIVE',
            owner: 'Enterprise MDM Hub',
            version: 1
          },
          'admin'
        );

        toastSuccess('Product created', 'تم إنشاء المنتج', sku, sku);
      }

      setIsAdding(false);
      resetForm();
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      toastError('Product save failed', 'فشل حفظ المنتج', message, message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleToggleStatus = async (product: ProductMaster) => {
    if (busyProductId) return;
    setBusyProductId(product.id);
    try {
      const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await ProductResourceMasterService.updateProduct(product.id, { status: nextStatus });
      toastSuccess('Product status updated', 'تم تحديث حالة المنتج', `${product.sku}: ${nextStatus}`, `${product.sku}: ${nextStatus}`);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product status';
      toastError('Product status failed', 'فشل تحديث حالة المنتج', message, message);
    } finally {
      setBusyProductId(null);
    }
  };

  const handleDelete = async (product: ProductMaster) => {
    await confirmAction({
      category: 'delete',
      titleEn: 'Delete product',
      titleAr: 'حذف المنتج',
      messageEn: `Delete product ${product.sku}? This action cannot be undone.`,
      messageAr: `هل تريد حذف المنتج ${product.sku}؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabelEn: 'Delete',
      confirmLabelAr: 'حذف',
      isDangerous: true,
      onConfirm: async () => {
        setBusyProductId(product.id);
        try {
          await ProductResourceMasterService.deleteProduct(product.id);
          toastSuccess('Product deleted', 'تم حذف المنتج', product.sku, product.sku);
          loadData();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete product';
          toastError('Product delete failed', 'فشل حذف المنتج', message, message);
        } finally {
          setBusyProductId(null);
        }
      }
    });
  };

  const filtered = products.filter(p => {
    const matchesSearch =
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.hsCode.includes(search);
    const matchesCat = selectedCategory === 'ALL' || p.commodityCategory === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {isAr ? 'مستكشف المنتجات وسجل الوحدات (Product SKU Registry)' : 'Global Product & SKU Master Registry'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAr
              ? 'السجل المركزي للمنتجات والرموز الشريطية (EAN/UPC/QR/RFID) وتصنيفات الجمارك HS Codes'
              : 'Single source of truth for items, global barcodes, RFID tags & HS customs classifications'}
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة منتج جديد' : 'Register Product SKU'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالكود أو الاسم أو كود الجمارك HS...' : 'Search SKU, Product Name or HS Code...'}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="ALL">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
            <option value="INDUSTRIAL_ELECTRONICS">Industrial Electronics</option>
            <option value="PETROCHEMICALS">Petrochemicals</option>
            <option value="PHARMACEUTICALS">Pharmaceuticals</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Product Modal/Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
          <h3 className="font-bold text-sm text-indigo-400">
            {editingProduct
              ? (isAr ? 'تعديل بيانات المنتج في النظام المركزي' : 'Edit Master Product Entity')
              : (isAr ? 'تسجيل منتج جديد في النظام المركزي' : 'Register Master Product Entity')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'رمز SKU' : 'SKU Code'}</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                disabled={Boolean(editingProduct)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="SKU-ELEC-2026"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="Smart Logistics Module"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                placeholder="وحدة الاتصال اللوجستية الذكية"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'الباركود (EAN/UPC)' : 'Barcode'}</label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                placeholder="6281100990011"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'كود النظام المنسق للجمارك HS Code' : 'HS Customs Code'}</label>
              <input
                type="text"
                value={hsCode}
                onChange={e => setHsCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                placeholder="9031.80.90"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">{isAr ? 'العلامة التجارية (Brand)' : 'Brand Name'}</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-amber-400 font-bold">
              <input
                type="checkbox"
                checked={isHazmat}
                onChange={e => setIsHazmat(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>{isAr ? 'مادة خطرة خاضعة للأنظمة (Hazmat)' : 'Contains Dangerous/Hazardous Materials'}</span>
            </label>

            {isHazmat && (
              <input
                type="text"
                value={unNumber}
                onChange={e => setUnNumber(e.target.value)}
                placeholder="UN Number (e.g. UN1993)"
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={isSavingProduct}
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="px-4 py-2 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSavingProduct}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingProduct ? (isAr ? 'تحديث المنتج' : 'Update Product SKU') : (isAr ? 'حفظ المنتج' : 'Save Product SKU')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-indigo-500 transition space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                    {p.sku}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{isAr ? p.nameAr : p.nameEn}</h3>
                  <div className="text-slate-400 text-xs">{p.brand} | Category: {p.commodityCategory}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 font-bold rounded-xl text-xs ${
                  p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.status}
                </span>
                <button
                  type="button"
                  onClick={() => openEditForm(p)}
                  disabled={busyProductId === p.id}
                  className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAr ? 'تعديل المنتج' : 'Edit product'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(p)}
                  disabled={busyProductId === p.id}
                  className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAr ? 'تفعيل/تعطيل المنتج' : 'Toggle product status'}
                >
                  {busyProductId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  disabled={busyProductId === p.id}
                  className="w-8 h-8 rounded-xl border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAr ? 'حذف المنتج' : 'Delete product'}
                >
                  {busyProductId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'رمز الباركود' : 'Barcode'}</span>
                <span className="font-mono font-bold text-slate-800">{p.barcode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'كود الجمارك' : 'HS Code'}</span>
                <span className="font-mono font-bold text-slate-800">{p.hsCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'الوزن/الوحدة' : 'Weight/UOM'}</span>
                <span className="font-bold text-slate-800">{p.weightKg} kg / {p.uom}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'تغليف/حرارة' : 'Package/Temp'}</span>
                <span className="font-bold text-slate-800">{p.packagingType} ({p.temperatureClass})</span>
              </div>
            </div>

            {p.isHazmat && (
              <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-xl font-bold border border-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Hazmat Commodity Regulated: {p.unNumber || 'UN Standard'} ({p.hazmatClass || 'Class 9'})</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
