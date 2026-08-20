import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  ShipmentCostBreakdown,
  FreightLandedCostCalculation,
  FreightInvoiceAuditRecord,
  ProfitabilityByRoute,
  FreightFinanceKPIs
} from '../../types/freightFinance';

const COST_BREAKDOWNS_COLLECTION = 'freight_cost_breakdowns';
const INVOICES_AUDIT_COLLECTION = 'freight_invoices_audit';
const LANDED_COST_COLLECTION = 'freight_landed_costs';

export const SEED_COST_BREAKDOWNS: ShipmentCostBreakdown[] = [
  {
    id: 'FCB-2026-8001',
    shipmentId: 'SHP-90412',
    trackingNumber: 'AJA-881920',
    customerName: 'شركة المراعي للشحن والخدمات المبردة',
    originCity: 'الدمام (ميناء الملك عبد العزيز)',
    destinationCity: 'الرياض (المرفق اللوجستي المركزي)',
    costCenterCode: 'CC-EAST-COLD-01',

    baseTransportationCostSAR: 2800,
    fuelSurchargeSAR: 420,
    driverLaborCostSAR: 350,
    vehicleDepreciationSAR: 180,
    warehouseStorageCostSAR: 250,
    insuranceCostSAR: 120,
    customsDutySAR: 0,
    accessorialChargesSAR: 150,
    vatTaxSAR: 640.5,

    totalActualCostSAR: 4270,
    totalBilledRevenueSAR: 5800,
    netProfitMarginSAR: 1530,
    marginPercent: 26.38,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'FCB-2026-8002',
    shipmentId: 'SHP-90415',
    trackingNumber: 'AJA-881923',
    customerName: 'الشركة السعودية للصناعات الأساسية (سابك)',
    originCity: 'الجبيل الصناعية',
    destinationCity: 'جدة (ميناء جدة الإسلامي)',
    costCenterCode: 'CC-CHEM-LOG-04',

    baseTransportationCostSAR: 6500,
    fuelSurchargeSAR: 980,
    driverLaborCostSAR: 800,
    vehicleDepreciationSAR: 450,
    warehouseStorageCostSAR: 600,
    insuranceCostSAR: 350,
    customsDutySAR: 1200,
    accessorialChargesSAR: 300,
    vatTaxSAR: 1677,

    totalActualCostSAR: 11180,
    totalBilledRevenueSAR: 14500,
    netProfitMarginSAR: 3320,
    marginPercent: 22.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'FCB-2026-8003',
    shipmentId: 'SHP-90420',
    trackingNumber: 'AJA-881930',
    customerName: 'مجموعة النهدي الطبية - المستودع الإقليمي',
    originCity: 'مطار الملك خالد الدولي بالرياض',
    destinationCity: 'نيوم / تبوك - المركز الطبي',
    costCenterCode: 'CC-PHARMA-COLD-02',

    baseTransportationCostSAR: 4200,
    fuelSurchargeSAR: 610,
    driverLaborCostSAR: 500,
    vehicleDepreciationSAR: 300,
    warehouseStorageCostSAR: 400,
    insuranceCostSAR: 250,
    customsDutySAR: 0,
    accessorialChargesSAR: 200,
    vatTaxSAR: 969,

    totalActualCostSAR: 6460,
    totalBilledRevenueSAR: 9200,
    netProfitMarginSAR: 2740,
    marginPercent: 29.78,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_INVOICE_AUDITS: FreightInvoiceAuditRecord[] = [
  {
    id: 'AUD-9001',
    invoiceNumber: 'INV-3PL-2026-4011',
    invoiceType: 'CARRIER_INVOICE',
    partyName: 'شركة المجدوعي للوجستيات وسلاسل الإمداد (3PL)',
    carrierOrVendorCode: 'CAR-AJA-3PL-01',
    billedAmountSAR: 14500,
    expectedContractAmountSAR: 14200,
    varianceSAR: 300,
    variancePercentage: 2.11,
    auditStatus: 'DISCREPANCY',
    discrepancyReasonAr: 'زيادة رسوم الانتظار والانتظار بمطابقة رسوم العبور عبر البوابة الجمركية بدون موافقة مسبقة.',
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-31',
  },
  {
    id: 'AUD-9002',
    invoiceNumber: 'INV-CUST-2026-8802',
    invoiceType: 'CUSTOMER_INVOICE',
    partyName: 'شركة المراعي للشحن والخدمات المبردة',
    carrierOrVendorCode: 'CUST-AJA-901',
    billedAmountSAR: 5800,
    expectedContractAmountSAR: 5800,
    varianceSAR: 0,
    variancePercentage: 0,
    auditStatus: 'MATCHED',
    discrepancyReasonAr: 'الفاتورة مطابقة تماماً لأسعار العقد والجداول الزمنية المعتمدة.',
    invoiceDate: '2026-08-02',
    dueDate: '2026-09-02',
  },
  {
    id: 'AUD-9003',
    invoiceNumber: 'INV-VENDOR-2026-1092',
    invoiceType: 'VENDOR_INVOICE',
    partyName: 'شركة التغذية والوقود السعودية (أرامكو للوقود)',
    carrierOrVendorCode: 'VEND-FUEL-009',
    billedAmountSAR: 22400,
    expectedContractAmountSAR: 22400,
    varianceSAR: 0,
    variancePercentage: 0,
    auditStatus: 'MATCHED',
    discrepancyReasonAr: 'تم الفحص التلقائي ومطابقة سحوبات بطاقات وقود الأسطول باللترات.',
    invoiceDate: '2026-08-03',
    dueDate: '2026-08-25',
  },
];

export const SEED_LANDED_COSTS: FreightLandedCostCalculation[] = [
  {
    id: 'LND-2026-01',
    orderNumber: 'PO-AJA-IMP-9081',
    productDescriptionAr: 'مستلزمات وأجهزة تبريد طبية عالية الدقة (صنع ألمانيا)',
    unitQuantity: 500,
    productBaseCostSAR: 250000,
    freightCostSAR: 18500,
    insuranceCostSAR: 3200,
    customsDutySAR: 12500,
    handlingCostSAR: 2800,
    totalLandedCostSAR: 287000,
    unitLandedCostSAR: 574,
    effectiveLandedMultiplier: 1.148,
  },
];

export const SEED_PROFITABILITY_ROUTES: ProfitabilityByRoute[] = [
  {
    routeKey: 'الدمام ↔ الرياض',
    originCity: 'الدمام',
    destinationCity: 'الرياض',
    totalShipmentsCount: 142,
    totalRevenueSAR: 823600,
    totalCostSAR: 606200,
    netProfitSAR: 217400,
    averageMarginPercent: 26.4,
    averageCostPerKmSAR: 3.85,
  },
  {
    routeKey: 'الجبيل ↔ جدة',
    originCity: 'الجبيل',
    destinationCity: 'جدة',
    totalShipmentsCount: 88,
    totalRevenueSAR: 1276000,
    totalCostSAR: 983800,
    netProfitSAR: 292200,
    averageMarginPercent: 22.9,
    averageCostPerKmSAR: 4.12,
  },
  {
    routeKey: 'الرياض ↔ تبوك / نيوم',
    originCity: 'الرياض',
    destinationCity: 'تبوك / نيوم',
    totalShipmentsCount: 64,
    totalRevenueSAR: 588800,
    totalCostSAR: 413400,
    netProfitSAR: 175400,
    averageMarginPercent: 29.8,
    averageCostPerKmSAR: 3.42,
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[FreightFinanceRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getShipmentCostBreakdowns(): Promise<ShipmentCostBreakdown[]> {
  return safeFetchCollection<ShipmentCostBreakdown>(COST_BREAKDOWNS_COLLECTION, SEED_COST_BREAKDOWNS);
}

export async function getFreightInvoiceAudits(): Promise<FreightInvoiceAuditRecord[]> {
  return safeFetchCollection<FreightInvoiceAuditRecord>(INVOICES_AUDIT_COLLECTION, SEED_INVOICE_AUDITS);
}

export async function getFreightLandedCosts(): Promise<FreightLandedCostCalculation[]> {
  return safeFetchCollection<FreightLandedCostCalculation>(LANDED_COST_COLLECTION, SEED_LANDED_COSTS);
}

export async function getProfitabilityRoutes(): Promise<ProfitabilityByRoute[]> {
  return SEED_PROFITABILITY_ROUTES;
}

export async function updateFreightInvoiceAuditStatus(
  invoiceId: string,
  auditStatus: 'MATCHED' | 'DISPUTED' | 'APPROVED',
  discrepancyReasonAr?: string
): Promise<boolean> {
  try {
    await getAdminFirestore().collection(INVOICES_AUDIT_COLLECTION).doc(invoiceId).update({
      auditStatus,
      discrepancyReasonAr,
    });
    return true;
  } catch (err) {
    console.warn('[FreightFinanceRepo] Invoice audit update fallback:', err);
    const found = SEED_INVOICE_AUDITS.find(i => i.id === invoiceId);
    if (found) {
      found.auditStatus = auditStatus;
      if (discrepancyReasonAr) found.discrepancyReasonAr = discrepancyReasonAr;
    }
    return true;
  }
}
