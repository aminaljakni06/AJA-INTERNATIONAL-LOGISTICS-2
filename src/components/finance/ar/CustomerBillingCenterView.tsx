import React, { useState } from 'react';
import {
  FilePlus,
  Boxes,
  FileCheck,
  Calculator,
  Plus,
  Trash2,
  Send,
  Building2,
  DollarSign,
  Percent,
  Layers,
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { BillingType, InvoiceSeries, CustomerInvoiceLine } from '../../../types/accountsReceivable';

export const CustomerBillingCenterView: React.FC<{ onInvoiceCreated?: () => void }> = ({ onInvoiceCreated }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [series, setSeries] = useState<InvoiceSeries>('INV-SA');
  const [billingType, setBillingType] = useState<BillingType>('SHIPMENT');
  const [customerId, setCustomerId] = useState<string>('cust-101');
  const [customerNameEn, setCustomerNameEn] = useState<string>('SABIC Petrochemicals Co.');
  const [customerNameAr, setCustomerNameAr] = useState<string>('شركة سابك للبتروكيماويات');
  const [customerTaxNumber, setCustomerTaxNumber] = useState<string>('300192847100003');
  const [currencyCode, setCurrencyCode] = useState<string>('SAR');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [poNumber, setPoNumber] = useState<string>('PO-2026-SA-001');

  // Line items state
  const [lines, setLines] = useState<CustomerInvoiceLine[]>([
    {
      id: 'line-init-1',
      descriptionEn: 'Freight Transport Services - Dammam to Riyadh Highway',
      descriptionAr: 'خدمات نقل البضائع - طريق الدمام الرياض السريع',
      quantity: 5,
      unitPriceSAR: 4200,
      lineTotalSAR: 21000,
      vatRatePercent: 15,
      vatAmountSAR: 3150,
      totalIncVatSAR: 24150,
      glAccountCode: '401000',
      costCenterCode: 'CC-EAST-01'
    }
  ]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculations
  const subtotalSAR = lines.reduce((sum, l) => sum + l.lineTotalSAR, 0);
  const totalVatSAR = lines.reduce((sum, l) => sum + l.vatAmountSAR, 0);
  const totalAmountSAR = subtotalSAR + totalVatSAR;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCustomerId(val);
    if (val === 'cust-101') {
      setCustomerNameEn('SABIC Petrochemicals Co.');
      setCustomerNameAr('شركة سابك للبتروكيماويات');
      setCustomerTaxNumber('300192847100003');
    } else if (val === 'cust-102') {
      setCustomerNameEn('Panda Retail Group KSA');
      setCustomerNameAr('مجموعة بنده للتجزئة السعودية');
      setCustomerTaxNumber('310022938400003');
    } else if (val === 'cust-103') {
      setCustomerNameEn('Almarai Logistics Division');
      setCustomerNameAr('شركة المراعي - قطاع اللوجستيات');
      setCustomerTaxNumber('300882192000003');
    } else if (val === 'cust-104') {
      setCustomerNameEn('Landmark Retail Dubai FZCO');
      setCustomerNameAr('مجموعة لاندمارك للتجزئة دبي');
      setCustomerTaxNumber('100293847500003');
    }
  };

  const handleAddLine = () => {
    const newLine: CustomerInvoiceLine = {
      id: `line-${Date.now()}`,
      descriptionEn: 'Additional Logistics Service Line Item',
      descriptionAr: 'بند خدمة لوجستية إضافية',
      quantity: 1,
      unitPriceSAR: 1500,
      lineTotalSAR: 1500,
      vatRatePercent: 15,
      vatAmountSAR: 225,
      totalIncVatSAR: 1725,
      glAccountCode: '401000'
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(lines.filter(l => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof CustomerInvoiceLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id !== id) return line;

      const updated = { ...line, [field]: value };

      if (field === 'quantity' || field === 'unitPriceSAR' || field === 'vatRatePercent') {
        const qty = Number(updated.quantity) || 0;
        const price = Number(updated.unitPriceSAR) || 0;
        const vatRate = Number(updated.vatRatePercent) || 0;

        updated.lineTotalSAR = qty * price;
        updated.vatAmountSAR = Math.round(updated.lineTotalSAR * (vatRate / 100));
        updated.totalIncVatSAR = updated.lineTotalSAR + updated.vatAmountSAR;
      }

      return updated;
    }));
  };

  const handleImportUnbilledShipments = () => {
    const importedLines: CustomerInvoiceLine[] = [
      ...lines,
      {
        id: `import-${Date.now()}-1`,
        descriptionEn: 'Imported Unbilled Shipment SHP-2026-9001 (Heavy Haul)',
        descriptionAr: 'شحنة غير مفوترة مستوردة SHP-2026-9001 (نقل ثقيل)',
        quantity: 1,
        unitPriceSAR: 8500,
        lineTotalSAR: 8500,
        vatRatePercent: 15,
        vatAmountSAR: 1275,
        totalIncVatSAR: 9775,
        glAccountCode: '401000',
        costCenterCode: 'CC-EAST-01'
      }
    ];
    setLines(importedLines);
  };

  const handleGenerateInvoice = async (statusToSet: 'DRAFT' | 'ISSUED') => {
    const issueDate = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + paymentTermsDays);
    const dueDate = due.toISOString().split('T')[0];

    const { invoice } = await AccountsReceivableClient.addInvoice({
      invoiceNumber: '', // repo auto generates
      series,
      customerId,
      customerNameEn,
      customerNameAr,
      customerTaxNumber,
      billingType,
      currencyCode,
      exchangeRateToBaseSAR: currencyCode === 'AED' ? 1.02 : 1.0,
      issueDate,
      dueDate,
      paymentTermsDays,
      lines,
      subtotalSAR,
      totalVatSAR,
      totalAmountSAR,
      totalAmountInCurrency: currencyCode === 'AED' ? Math.round(totalAmountSAR / 1.02) : totalAmountSAR,
      status: statusToSet,
      poNumber,
      attachmentsCount: 2,
      revisionNumber: 1
    });

    setSuccessMessage(
      isAr
        ? `تم إصدار الفاتورة بنجاح برقم: ${invoice.invoiceNumber} (${statusToSet === 'ISSUED' ? 'صادرة ومعتمدة' : 'مسودة'})`
        : `Invoice created successfully: ${invoice.invoiceNumber} (${statusToSet})`
    );

    if (onInvoiceCreated) onInvoiceCreated();

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <FilePlus className="w-4 h-4" />
            <span>{isAr ? 'مركز الفوترة وإعادة المحاسبة' : 'Customer Billing & Invoicing Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'إنشاء وتجهيز فواتير المبيعات للعملاء' : 'Create Sales Invoice & Order-to-Cash Billing'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'إصدار الفواتير الفردية، المجمعة، العقود والاقساط مع حساب ضريبة القيمة المضافة ZATCA' : 'Issue consolidated, shipment, contract, or milestone invoices with VAT compliance.'}
          </p>
        </div>

        <button
          onClick={handleImportUnbilledShipments}
          className="px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <Boxes className="w-4 h-4" />
          <span>{isAr ? 'استيراد الشحنات غير المفوترة (Auto-Import)' : 'Import Unbilled Shipments'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Invoice Setup Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Header Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'بيانات العميل والسلسلة المحاسبية' : 'Invoice Series & Customer Header'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'سلسلة ترقيم الفواتير' : 'Invoice Series'}</label>
                <select
                  value={series}
                  onChange={e => setSeries(e.target.value as InvoiceSeries)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="INV-SA">INV-SA (Saudi Arabia KSA - SAR)</option>
                  <option value="INV-UAE">INV-UAE (United Arab Emirates - AED)</option>
                  <option value="INV-INTL">INV-INTL (International Multi-Currency)</option>
                  <option value="INV-MIL">INV-MIL (Milestone Contract Series)</option>
                  <option value="INV-CON">INV-CON (Consolidated Parent Invoice)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'نوع الفوترة (Billing Method)' : 'Billing Type'}</label>
                <select
                  value={billingType}
                  onChange={e => setBillingType(e.target.value as BillingType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="SHIPMENT">{isAr ? 'فوترة شحنات لوجستية (Shipment)' : 'Shipment Billing'}</option>
                  <option value="CONTRACT">{isAr ? 'فوترة عقد وتأجير أسطول (Contract)' : 'Contract Billing'}</option>
                  <option value="RECURRING">{isAr ? 'فوترة اشتراك ومستودع دوري (Recurring)' : 'Recurring Billing'}</option>
                  <option value="MILESTONE">{isAr ? 'فوترة مراحل وإنجاز (Milestone)' : 'Milestone Billing'}</option>
                  <option value="CONSOLIDATED">{isAr ? 'فوترة مجمعة متعددة الفروع (Consolidated)' : 'Consolidated Billing'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'عميل الشركة' : 'Customer Account'}</label>
                <select
                  value={customerId}
                  onChange={handleCustomerChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="cust-101">SABIC Petrochemicals Co. (سابك)</option>
                  <option value="cust-102">Panda Retail Group KSA (بنده)</option>
                  <option value="cust-103">Almarai Logistics Division (المراعي)</option>
                  <option value="cust-104">Landmark Retail Dubai FZCO (لاندمارك)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'الرقم الضريبي للعميل (VAT ID)' : 'Customer VAT ID'}</label>
                <input
                  type="text"
                  value={customerTaxNumber}
                  onChange={e => setCustomerTaxNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'شروط أصل السداد (Payment Terms)' : 'Payment Terms'}</label>
                <select
                  value={paymentTermsDays}
                  onChange={e => setPaymentTermsDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={15}>Net 15 Days</option>
                  <option value={30}>Net 30 Days</option>
                  <option value={60}>Net 60 Days</option>
                  <option value={90}>Net 90 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">{isAr ? 'رقم أمر الشراء (PO Number)' : 'Customer PO Ref'}</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Invoice Line Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'بنود خدمات الفاتورة والتكاليف' : 'Invoice Line Items & Services'}</span>
              </h3>
              <button
                onClick={handleAddLine}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة بند جديد' : 'Add Line'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-2 min-w-[220px]">{isAr ? 'وصف الخدمة / البند' : 'Description'}</th>
                    <th className="p-2 w-20">{isAr ? 'الكمية' : 'Qty'}</th>
                    <th className="p-2 min-w-[110px]">{isAr ? 'السعر (SAR)' : 'Price (SAR)'}</th>
                    <th className="p-2 w-24">{isAr ? 'الضريبة %' : 'VAT %'}</th>
                    <th className="p-2 min-w-[100px]">{isAr ? 'مبلغ الضريبة' : 'VAT SAR'}</th>
                    <th className="p-2 min-w-[110px]">{isAr ? 'الإجمالي' : 'Total (SAR)'}</th>
                    <th className="p-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-800/40">
                      <td className="p-2">
                        <input
                          type="text"
                          value={isAr ? line.descriptionAr : line.descriptionEn}
                          onChange={e => handleUpdateLine(line.id, isAr ? 'descriptionAr' : 'descriptionEn', e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={e => handleUpdateLine(line.id, 'quantity', Number(e.target.value))}
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-2 text-white text-xs font-mono text-center focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.unitPriceSAR}
                          onChange={e => handleUpdateLine(line.id, 'unitPriceSAR', Number(e.target.value))}
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={line.vatRatePercent}
                          onChange={e => handleUpdateLine(line.id, 'vatRatePercent', Number(e.target.value))}
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                        >
                          <option value={15}>15% (KSA)</option>
                          <option value={5}>5% (UAE)</option>
                          <option value={0}>0% (Export/Exempt)</option>
                        </select>
                      </td>
                      <td className="p-2 font-mono text-amber-400 font-semibold">
                        SAR {line.vatAmountSAR.toLocaleString()}
                      </td>
                      <td className="p-2 font-mono text-emerald-400 font-bold">
                        SAR {line.totalIncVatSAR.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Totals Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'الملخص المالي والضرائب' : 'Invoice Financial Summary'}</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'المجموع الفرعي (قبل الضريبة)' : 'Subtotal Excl. VAT:'}</span>
                <span className="text-slate-200 font-bold">SAR {subtotalSAR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'إجمالي ضريبة القيمة المضافة:' : 'Total VAT (15%):'}</span>
                <span className="text-amber-400 font-bold">SAR {totalVatSAR.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm">
                <span className="text-white font-bold">{isAr ? 'الإجمالي القابل للسداد:' : 'Total Amount Due:'}</span>
                <span className="text-emerald-400 font-extrabold">SAR {totalAmountSAR.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-sky-400">{isAr ? 'الامتثال للبيئة الضريبية ZATCA Phase 2' : 'ZATCA Phase 2 E-Invoicing Compliant'}</div>
              <div>{isAr ? 'سيتم توليد الـ QR Code والتوقيع الرقمي فور الاعتماد.' : 'Cryptographic stamp & QR code generated automatically.'}</div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleGenerateInvoice('ISSUED')}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'اعتماد وإصدار الفاتورة فوراً' : 'Approve & Issue Sales Invoice'}</span>
              </button>

              <button
                onClick={() => handleGenerateInvoice('DRAFT')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'حفظ كمسودة غير معتمدة' : 'Save as Unapproved Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
