import { 
  MasterDataRecord, 
  MasterDataVersionRecord, 
  MasterRelationship, 
  DuplicatePair, 
  MasterDataDomain 
} from '../../types/mdm';

// In-memory initial seed records for all major logistics & enterprise MDM domains
const initialMasterRecords: MasterDataRecord[] = [
  // Countries
  {
    id: 'mdm_cnt_sa',
    domain: 'COUNTRY',
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    description: 'Kingdom of Saudi Arabia - Primary Regional Operations Hub',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Aja Logistics Data Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { iso2: 'SA', iso3: 'SAU', numericCode: '682', phoneCode: '+966', region: 'GCC' },
    tags: ['GCC', 'MENA', 'PRIMARY_HQ'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_cnt_ae',
    domain: 'COUNTRY',
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    description: 'United Arab Emirates Regional Logistics Hub',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Aja Logistics Data Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { iso2: 'AE', iso3: 'ARE', numericCode: '784', phoneCode: '+971', region: 'GCC' },
    tags: ['GCC', 'MENA', 'HUB'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_cnt_cn',
    domain: 'COUNTRY',
    code: 'CN',
    nameAr: 'جمهورية الصين الشعبية',
    nameEn: 'China',
    description: 'People\'s Republic of China - Key Trade Lane Origin',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Global Trade Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { iso2: 'CN', iso3: 'CHN', numericCode: '156', phoneCode: '+86', region: 'ASIA' },
    tags: ['TRADE_ORIGIN', 'APAC'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Currencies
  {
    id: 'mdm_cur_sar',
    domain: 'CURRENCY',
    code: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    description: 'Official Currency of the Kingdom of Saudi Arabia (Pegged to USD)',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Finance Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { symbol: 'ر.س', decimals: 2, isBaseCurrency: true },
    tags: ['GCC', 'BASE_CURRENCY'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_cur_usd',
    domain: 'CURRENCY',
    code: 'USD',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    description: 'United States Dollar - International Trade Base',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Finance Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { symbol: '$', decimals: 2, isBaseCurrency: false },
    tags: ['GLOBAL_TRADE', 'USD'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Exchange Rates
  {
    id: 'mdm_exr_sar_usd',
    domain: 'EXCHANGE_RATE',
    code: 'EXR-SAR-USD',
    nameAr: 'سعر صرف الريال مقابل الدولار',
    nameEn: 'SAR to USD Exchange Rate',
    description: 'Fixed peg rate 3.75 SAR per 1 USD',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Treasury Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { fromCurrency: 'SAR', toCurrency: 'USD', rate: 0.266667, inverseRate: 3.75 },
    tags: ['EXCHANGE_RATE', 'FIXED_PEG'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Incoterms
  {
    id: 'mdm_inc_fob',
    domain: 'INCOTERM',
    code: 'FOB',
    nameAr: 'تسليم على متن السفينة (FOB)',
    nameEn: 'Free On Board (FOB)',
    description: 'Incoterms 2020 - Risk passes to buyer once loaded onto vessel',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Freight Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { modeOfTransport: 'SEA', buyerResponsibilityPct: 50 },
    tags: ['INCOTERMS_2020', 'MARITIME'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_inc_cif',
    domain: 'INCOTERM',
    code: 'CIF',
    nameAr: 'التكلفة والتأمين والشحن (CIF)',
    nameEn: 'Cost, Insurance and Freight (CIF)',
    description: 'Incoterms 2020 - Seller covers freight and marine insurance to destination port',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Freight Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { modeOfTransport: 'SEA', includesInsurance: true },
    tags: ['INCOTERMS_2020', 'MARITIME'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_inc_ddp',
    domain: 'INCOTERM',
    code: 'DDP',
    nameAr: 'تسليم البضاعة مدفوعة الرسوم (DDP)',
    nameEn: 'Delivered Duty Paid (DDP)',
    description: 'Incoterms 2020 - Maximum seller responsibility including customs clearance and duties',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Customs Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { modeOfTransport: 'ALL', includesCustomsDuties: true },
    tags: ['INCOTERMS_2020', 'DOOR_TO_DOOR'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Ports
  {
    id: 'mdm_prt_jed',
    domain: 'PORT',
    code: 'SAJED',
    nameAr: 'ميناء جدة الإسلامي',
    nameEn: 'Jeddah Islamic Port',
    description: 'Primary Western Sea Gate of Saudi Arabia on Red Sea',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Port Ops Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { unlocode: 'SAJED', countryCode: 'SA', latitude: 21.4858, longitude: 39.1925, maxDraftMeters: 18 },
    tags: ['SEA_PORT', 'RED_SEA', 'CUSTOMS_GATE'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_prt_dmm',
    domain: 'PORT',
    code: 'SADMM',
    nameAr: 'ميناء الملك عبد العزيز بالدمام',
    nameEn: 'King Abdulaziz Port Dammam',
    description: 'Major Eastern Sea Gate of Saudi Arabia on Arabian Gulf',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Port Ops Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { unlocode: 'SADMM', countryCode: 'SA', latitude: 26.4344, longitude: 50.1033, maxDraftMeters: 16 },
    tags: ['SEA_PORT', 'ARABIAN_GULF', 'INDUSTRIAL_GATE'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Container Types
  {
    id: 'mdm_cntr_20gp',
    domain: 'CONTAINER_TYPE',
    code: '20GP',
    nameAr: 'حاوية نمطية 20 قدم جافة',
    nameEn: '20ft General Purpose Dry Container',
    description: 'Standard 20 foot dry cargo shipping container',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Equipment Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { lengthFeet: 20, maxPayloadKg: 28200, volumeCbm: 33.2, tareKg: 2300 },
    tags: ['CONTAINER', 'DRY_CARGO', 'TEU_1'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_cntr_40hc',
    domain: 'CONTAINER_TYPE',
    code: '40HC',
    nameAr: 'حاوية 40 قدم عالية السقف (High Cube)',
    nameEn: '40ft High Cube Container',
    description: 'Extra height 40 foot shipping container for light voluminous cargo',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Equipment Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { lengthFeet: 40, maxPayloadKg: 28600, volumeCbm: 76.4, tareKg: 3900 },
    tags: ['CONTAINER', 'HIGH_CUBE', 'FEU_1'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Units Of Measure (UOM)
  {
    id: 'mdm_uom_kg',
    domain: 'UOM',
    code: 'KG',
    nameAr: 'كيلوجرام',
    nameEn: 'Kilogram',
    description: 'SI Base Unit of Mass Weight',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Logistics Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { category: 'WEIGHT', baseFactor: 1.0 },
    tags: ['WEIGHT', 'STANDARD_UOM'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'mdm_uom_cbm',
    domain: 'UOM',
    code: 'CBM',
    nameAr: 'متر مكعب',
    nameEn: 'Cubic Meter',
    description: 'Standard Freight Volumetric Freight Unit',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Logistics Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { category: 'VOLUME', baseFactor: 1.0 },
    tags: ['VOLUME', 'FREIGHT_UOM'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Tax & VAT Codes
  {
    id: 'mdm_tax_vat15',
    domain: 'TAX_CODE',
    code: 'VAT15',
    nameAr: 'ضريبة القيمة المضافة 15%',
    nameEn: 'Saudi Value Added Tax 15%',
    description: 'Standard VAT Rate mandated by ZATCA in Saudi Arabia',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Tax & Regulatory Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { ratePct: 15.0, authority: 'ZATCA', taxType: 'VAT' },
    tags: ['ZATCA', 'VAT_15', 'TAX'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Hazardous Materials
  {
    id: 'mdm_haz_class3',
    domain: 'HAZMAT',
    code: 'HAZ-CLASS-3',
    nameAr: 'سوائل قابلة للاشتعال (الصنف 3)',
    nameEn: 'Class 3 Flammable Liquids',
    description: 'IMO DG Class 3 - Paints, alcohols, petroleum products',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Safety & Compliance Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { imoClass: '3', emergencyResponseCode: '3Y', requiresSpecialPermit: true },
    tags: ['DG_CARGO', 'HAZMAT', 'IMO_3'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Service Catalog
  {
    id: 'mdm_srv_air',
    domain: 'SERVICE_CATALOG',
    code: 'SRV-AIR-EXP',
    nameAr: 'الشحن الجوي السريع',
    nameEn: 'Air Freight Express Service',
    description: 'Time-critical international and domestic air freight logistics',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Logistics Service Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { slaHours: 24, transportMode: 'AIR', priorityLevel: 'HIGH' },
    tags: ['EXPRESS', 'AIR_FREIGHT', 'SERVICE'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },

  // Warehouses
  {
    id: 'mdm_wh_ryd_01',
    domain: 'WAREHOUSE',
    code: 'WH-RYD-LOGISTICS',
    nameAr: 'مستودع الرياض المركزي اللوجستي',
    nameEn: 'Riyadh Central Logistics Warehouse',
    description: 'Primary Bonded & Temperature Controlled Distribution Center in Riyadh Industry Zone',
    status: 'ACTIVE',
    approvalStatus: 'APPROVED',
    owner: 'usr_admin_01',
    steward: 'Warehouse Operations Steward',
    version: 1,
    createdBy: 'SYSTEM',
    updatedBy: 'SYSTEM',
    effectiveDate: '2026-01-01T00:00:00.000Z',
    companyScope: ['GLOBAL'],
    branchScope: ['GLOBAL'],
    metadata: { totalSqm: 25000, palletCapacity: 18000, hasColdChain: true, isBonded: true },
    tags: ['RIYADH', 'WAREHOUSE', 'COLD_CHAIN', 'BONDED'],
    isDeleted: false,
    qualityScore: 100,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

// Persistent Memory Stores
let masterRecordsStore: MasterDataRecord[] = [...initialMasterRecords];
let versionHistoryStore: MasterDataVersionRecord[] = [];
let relationshipsStore: MasterRelationship[] = [
  {
    id: 'rel_001',
    sourceEntityId: 'mdm_prt_jed',
    sourceDomain: 'PORT',
    targetEntityId: 'mdm_cnt_sa',
    targetDomain: 'COUNTRY',
    relationshipType: 'BELONGS_TO',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'SYSTEM'
  }
];
let duplicatesStore: DuplicatePair[] = [];

// Repository API
export async function listMasterRecords(filter?: {
  domain?: MasterDataDomain;
  status?: string;
  search?: string;
  companyScope?: string;
  branchScope?: string;
}): Promise<MasterDataRecord[]> {
  let records = masterRecordsStore.filter(r => !r.isDeleted);

  if (filter?.domain) {
    records = records.filter(r => r.domain === filter.domain);
  }
  if (filter?.status) {
    records = records.filter(r => r.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    records = records.filter(r => 
      r.code.toLowerCase().includes(q) ||
      r.nameAr.toLowerCase().includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }
  return records;
}

export async function getMasterRecordById(id: string): Promise<MasterDataRecord | null> {
  const record = masterRecordsStore.find(r => r.id === id && !r.isDeleted);
  return record || null;
}

export async function saveMasterRecord(record: MasterDataRecord): Promise<MasterDataRecord> {
  const index = masterRecordsStore.findIndex(r => r.id === record.id);
  
  // Record version snapshot
  const versionSnapshot: MasterDataVersionRecord = {
    id: `ver_${record.id}_v${record.version}_${Date.now()}`,
    masterRecordId: record.id,
    domain: record.domain,
    version: record.version,
    snapshot: JSON.parse(JSON.stringify(record)),
    changedBy: record.updatedBy || 'SYSTEM',
    changeReason: `Version ${record.version} update`,
    timestamp: new Date().toISOString()
  };
  versionHistoryStore.push(versionSnapshot);

  if (index >= 0) {
    masterRecordsStore[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    masterRecordsStore.push(record);
  }

  return record;
}

export async function softDeleteMasterRecord(id: string, actorUserId: string): Promise<boolean> {
  const record = masterRecordsStore.find(r => r.id === id);
  if (record) {
    record.isDeleted = true;
    record.status = 'ARCHIVED';
    record.updatedBy = actorUserId;
    record.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export async function listVersionHistory(masterRecordId: string): Promise<MasterDataVersionRecord[]> {
  return versionHistoryStore
    .filter(v => v.masterRecordId === masterRecordId)
    .sort((a, b) => b.version - a.version);
}

export async function listRelationships(entityId?: string): Promise<MasterRelationship[]> {
  if (!entityId) return relationshipsStore;
  return relationshipsStore.filter(rel => rel.sourceEntityId === entityId || rel.targetEntityId === entityId);
}

export async function saveRelationship(relationship: MasterRelationship): Promise<MasterRelationship> {
  const index = relationshipsStore.findIndex(r => r.id === relationship.id);
  if (index >= 0) {
    relationshipsStore[index] = relationship;
  } else {
    relationshipsStore.push(relationship);
  }
  return relationship;
}

export async function removeRelationship(id: string): Promise<boolean> {
  const len = relationshipsStore.length;
  relationshipsStore = relationshipsStore.filter(r => r.id !== id);
  return relationshipsStore.length < len;
}

export async function listDuplicates(): Promise<DuplicatePair[]> {
  return duplicatesStore;
}

export async function saveDuplicatePair(pair: DuplicatePair): Promise<DuplicatePair> {
  const index = duplicatesStore.findIndex(p => p.id === pair.id);
  if (index >= 0) {
    duplicatesStore[index] = pair;
  } else {
    duplicatesStore.push(pair);
  }
  return pair;
}
