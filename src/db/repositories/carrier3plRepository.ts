import {
  CarrierPartnerProfile,
  FreightRateSheet,
  FreightTender,
  CarrierBid,
  EdiIntegrationSpec
} from '../../types/carrier3pl';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const CARRIERS_COLLECTION = 'carrier_partners';
const TENDERS_COLLECTION = 'freight_tenders';

export const SEED_CARRIER_PARTNERS: CarrierPartnerProfile[] = [
  {
    id: 'CAR-AJA-3PL-01',
    partnerCode: '3PL-MTS-01',
    companyName: 'شركة المجدوعي للوجستيات وسلاسل الإمداد (Almajdouie Logistics 3PL)',
    partnerType: '3PL_PROVIDER',
    transportModes: ['ROAD_FREIGHT', 'MULTIMODAL'],
    operatingRegions: ['المنطقة الشرقية', 'الرياض', 'جدة', 'دبي'],
    fleetSizeCount: 420,
    contactPerson: {
      name: 'مهندس / فهد المجدوعي',
      role: 'مدير عمليات الشركاء والـ 3PL',
      email: 'f.almajdouie@logistics-partner.sa',
      phone: '+966 13 881 9900',
    },
    contractStatus: 'ACTIVE',
    slaOnTimeDeliveryRate: 98.9,
    overallRatingStars: 4.9,
    greenFleetScore: 92,
    bankName: 'البنك الأهلي السعودي (SNB)',
    ibanNumber: 'SA8810000001239988112001',
    vatTaxNumber: '31099281000003',
    complianceDocs: [
      {
        id: 'DOC-1',
        docType: 'COMMERCIAL_REGISTRATION',
        documentNumber: '2050012988',
        issuingAuthority: 'وزارة التجارة - الدمام',
        expiryDate: '2028-12-31',
        verificationStatus: 'VERIFIED',
      },
      {
        id: 'DOC-2',
        docType: 'TRANSPORT_PERMIT',
        documentNumber: 'TGA-SA-99012',
        issuingAuthority: 'الهيئة العامة للنقل (TGA)',
        expiryDate: '2027-06-30',
        verificationStatus: 'VERIFIED',
      },
    ],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CAR-AJA-4PL-02',
    partnerCode: '4PL-DHL-02',
    companyName: 'دي إتش إل للحلول اللوجستية المتكاملة (DHL Supply Chain 4PL)',
    partnerType: '4PL_INTEGRATOR',
    transportModes: ['ROAD_FREIGHT', 'AIR_FREIGHT', 'OCEAN_FREIGHT'],
    operatingRegions: ['تغطية عالمية', 'المملكة العربية السعودية', 'دول الخليج (GCC)'],
    fleetSizeCount: 1200,
    contactPerson: {
      name: 'Mr. David Vance',
      role: 'Global Key Account Director - Saudi Arabia',
      email: 'david.vance@dhl-partners.com',
      phone: '+966 11 499 8812',
    },
    contractStatus: 'ACTIVE',
    slaOnTimeDeliveryRate: 99.2,
    overallRatingStars: 5.0,
    greenFleetScore: 95,
    bankName: 'بنك الرياض',
    ibanNumber: 'SA4420000009988112233001',
    vatTaxNumber: '30011928000003',
    complianceDocs: [
      {
        id: 'DOC-3',
        docType: 'ISO_CERTIFICATE',
        documentNumber: 'ISO-9001-2025-AJA',
        issuingAuthority: 'Bureau Veritas',
        expiryDate: '2028-01-01',
        verificationStatus: 'VERIFIED',
      },
    ],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CAR-AJA-BROKER-03',
    partnerCode: 'CST-BAHRI-03',
    companyName: 'مؤسسة الساحل للتخليص الجمركي والشحن البحري',
    partnerType: 'CUSTOMS_BROKER',
    transportModes: ['OCEAN_FREIGHT', 'ROAD_FREIGHT'],
    operatingRegions: ['ميناء الملك عبد العزيز - الدمام', 'ميناء جدة الإسلامي'],
    fleetSizeCount: 35,
    contactPerson: {
      name: 'أحمد سعيد باجبر',
      role: 'مخلص جمركي معتمد',
      email: 'a.bajaber@customs-clearance.sa',
      phone: '+966 50 332 1199',
    },
    contractStatus: 'ACTIVE',
    slaOnTimeDeliveryRate: 96.8,
    overallRatingStars: 4.7,
    greenFleetScore: 84,
    bankName: 'مصرف الراجحي',
    ibanNumber: 'SA1280000004411223344001',
    vatTaxNumber: '31100293000003',
    complianceDocs: [],
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

export const SEED_RATE_SHEETS: FreightRateSheet[] = [
  {
    id: 'RATE-801',
    carrierId: 'CAR-AJA-3PL-01',
    carrierName: 'Almajdouie Logistics 3PL',
    originCity: 'الدمام / الميناء الجاف',
    destinationCity: 'الرياض / المرفق المركزي',
    mode: 'ROAD_FREIGHT',
    baseRateSARPerTon: 85,
    fuelSurchargePercentage: 4.5,
    minimumChargeSAR: 1500,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    currency: 'SAR',
  },
  {
    id: 'RATE-802',
    carrierId: 'CAR-AJA-4PL-02',
    carrierName: 'DHL Supply Chain 4PL',
    originCity: 'مطار الملك خالد الدولي بالرياض',
    destinationCity: 'مطار مطار الملك عبد العزيز بجدة',
    mode: 'AIR_FREIGHT',
    baseRateSARPerTon: 420,
    fuelSurchargePercentage: 8.0,
    minimumChargeSAR: 3500,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    currency: 'SAR',
  },
];

export const SEED_TENDERS: FreightTender[] = [
  {
    id: 'TND-2026-EAST-01',
    tenderNumber: 'TND-2026-EAST-01',
    title: 'مناقصة نقل البضائع المبردة السنوية (مسار الدمام - جدة)',
    originRegion: 'المنطقة الشرقية',
    destinationRegion: 'المنطقة الغربية',
    cargoDescription: 'مواد غذائية وأدوية مبردة ذات درجة حرارة محددة (+2°C إلى +8°C)',
    totalEstimatedTons: 12500,
    requiredMode: 'ROAD_FREIGHT',
    publishedDate: '2026-07-15',
    bidDeadlineDate: '2026-08-15',
    status: 'BIDDING',
    invitedCarrierIds: ['CAR-AJA-3PL-01', 'CAR-AJA-4PL-02'],
  },
];

export const SEED_BIDS: CarrierBid[] = [
  {
    id: 'BID-901',
    tenderId: 'TND-2026-EAST-01',
    carrierId: 'CAR-AJA-3PL-01',
    carrierName: 'Almajdouie Logistics 3PL',
    bidAmountSAR: 980000,
    committedTransitDays: 1,
    guaranteedOnTimeSlaPercent: 99.0,
    bidSubmissionDate: '2026-08-01T10:00:00Z',
    isWinningBid: false,
  },
  {
    id: 'BID-902',
    tenderId: 'TND-2026-EAST-01',
    carrierId: 'CAR-AJA-4PL-02',
    carrierName: 'DHL Supply Chain 4PL',
    bidAmountSAR: 940000,
    committedTransitDays: 1,
    guaranteedOnTimeSlaPercent: 99.5,
    bidSubmissionDate: '2026-08-02T14:30:00Z',
    isWinningBid: false,
  },
];

export const SEED_EDI_SPECS: EdiIntegrationSpec[] = [
  {
    id: 'EDI-101',
    partnerId: 'CAR-AJA-4PL-02',
    partnerName: 'DHL Supply Chain 4PL',
    protocol: 'REST_API',
    supportedEdiTransactions: [
      '204_MOTOR_CARRIER_LOAD_TENDER',
      '214_SHIPMENT_STATUS',
      '210_FREIGHT_INVOICE',
    ],
    endpointUrl: 'https://api.dhl-supplychain.com/v2/edi/aja-gateway',
    status: 'ACTIVE',
  },
  {
    id: 'EDI-102',
    partnerId: 'CAR-AJA-3PL-01',
    partnerName: 'Almajdouie Logistics 3PL',
    protocol: 'AS2',
    supportedEdiTransactions: ['214_SHIPMENT_STATUS', '210_FREIGHT_INVOICE'],
    endpointUrl: 'as2://edi.almajdouie.sa:8443/as2/receiver',
    status: 'ACTIVE',
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[Carrier3PLRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getCarrierPartners(): Promise<CarrierPartnerProfile[]> {
  return safeFetchCollection<CarrierPartnerProfile>(CARRIERS_COLLECTION, SEED_CARRIER_PARTNERS);
}

export async function getFreightRateSheets(): Promise<FreightRateSheet[]> {
  return safeFetchCollection<FreightRateSheet>('freight_rates', SEED_RATE_SHEETS);
}

export async function getFreightTenders(): Promise<FreightTender[]> {
  return safeFetchCollection<FreightTender>(TENDERS_COLLECTION, SEED_TENDERS);
}

export async function getCarrierBids(): Promise<CarrierBid[]> {
  return safeFetchCollection<CarrierBid>('carrier_bids', SEED_BIDS);
}

export async function getEdiSpecs(): Promise<EdiIntegrationSpec[]> {
  return safeFetchCollection<EdiIntegrationSpec>('edi_specs', SEED_EDI_SPECS);
}
