import { MDMGoldenRecord } from './types';

export class MDMGovernanceService {
  private static readonly GOLDEN_RECORDS: MDMGoldenRecord[] = [
    {
      id: 'MDM-CUST-1001',
      masterDomain: 'CUSTOMER',
      entityNameEn: 'Saudi Aramco Base Oil Company (Luberef)',
      entityNameAr: 'شركة أرامكو السعودية لزيوت الأساس (لوبريف)',
      globalIdentifier: 'AJA-GOLD-CUST-1001',
      sourceSystemsSynced: ['SAP ERP', 'Salesforce CRM', 'AJA WMS', 'TMS Core'],
      dataSteward: 'Hassan Al-Otaibi (Lead Data Steward)',
      approvalStatus: 'APPROVED',
      qualityScore: 98.5,
      versionHistoryCount: 14,
      lastUpdatedAt: new Date().toISOString(),
      attributes: {
        vatNumber: '300018291000003',
        commercialRegister: '1010192840',
        creditLimitSAR: 5000000,
        paymentTerms: '60 Days Net',
        assignedKeyAccountManager: 'Tariq Al-Harbi',
        riskCategory: 'LOW_RISK_ENTERPRISE',
      },
    },
    {
      id: 'MDM-SUPP-2002',
      masterDomain: 'CARRIER',
      entityNameEn: 'A.P. Moller - Maersk Ocean Shipping',
      entityNameAr: 'ميرسك العالمية للشحن البحري',
      globalIdentifier: 'AJA-GOLD-CARR-2002',
      sourceSystemsSynced: ['Procurement Hub', 'Control Tower API', 'Finance Ledger'],
      dataSteward: 'Reem Al-Ghamdi (Carrier Data Steward)',
      approvalStatus: 'APPROVED',
      qualityScore: 99.1,
      versionHistoryCount: 8,
      lastUpdatedAt: new Date().toISOString(),
      attributes: {
        scacCode: 'MAEU',
        imoRegistry: 'IMO-98201',
        contractReference: 'AJA-MAERSK-2026-MSA',
        averageOtifPercentage: 96.4,
        preferredPorts: ['Jeddah Islamic Port', 'King Abdulaziz Port Dammam'],
      },
    },
    {
      id: 'MDM-WH-3003',
      masterDomain: 'WAREHOUSE',
      entityNameEn: 'AJA Logistics Central Fulfillment Hub - Riyadh North',
      entityNameAr: 'مستودع أجا اللوجستي المركزي - شمال الرياض',
      globalIdentifier: 'AJA-GOLD-WH-3003',
      sourceSystemsSynced: ['WMS Core', 'WES Automation', 'ERP Inventory'],
      dataSteward: 'Fahad Al-Qahtani (Warehouse Operations Steward)',
      approvalStatus: 'APPROVED',
      qualityScore: 97.8,
      versionHistoryCount: 22,
      lastUpdatedAt: new Date().toISOString(),
      attributes: {
        totalAreaSqM: 45000,
        palletCapacity: 38000,
        temperatureZones: ['AMBIENT', 'CHILLED_2_8C', 'FROZEN_NEG_20C'],
        automationLevel: 'SEMI_AUTOMATED_ASRS',
        activeStorageBinsCount: 14200,
      },
    },
    {
      id: 'MDM-VEH-4004',
      masterDomain: 'VEHICLE',
      entityNameEn: 'Heavy Duty Mercedes Actros 1845 LS (Fleet #402)',
      entityNameAr: 'شاحنة نقل ثقيل مرسيدس اكتروس (أسطول #402)',
      globalIdentifier: 'AJA-GOLD-FLEET-4004',
      sourceSystemsSynced: ['Fleet GPS Telematics', 'TMS Dispatch', 'Maintenance ERP'],
      dataSteward: 'Sultan Al-Mansoor (Fleet Data Steward)',
      approvalStatus: 'APPROVED',
      qualityScore: 96.2,
      versionHistoryCount: 11,
      lastUpdatedAt: new Date().toISOString(),
      attributes: {
        plateNumber: 'أ ج أ 9821',
        chassisVIN: 'WDB9634031L298102',
        engineCapacityHP: 450,
        fuelType: 'DIESEL_EURO6',
        gpsTrackerImei: '869201928401928',
      },
    },
  ];

  public static getGoldenRecords(domainFilter?: string): MDMGoldenRecord[] {
    if (!domainFilter) return this.GOLDEN_RECORDS;
    return this.GOLDEN_RECORDS.filter(
      (r) => r.masterDomain.toLowerCase() === domainFilter.toLowerCase()
    );
  }

  public static createOrUpdateGoldenRecord(record: Partial<MDMGoldenRecord>): MDMGoldenRecord {
    const id = record.id || `MDM-GEN-${Date.now().toString().slice(-4)}`;
    const newRecord: MDMGoldenRecord = {
      id,
      masterDomain: record.masterDomain || 'CUSTOMER',
      entityNameEn: record.entityNameEn || 'New Golden Record',
      entityNameAr: record.entityNameAr || 'سجل ذهبي جديد',
      globalIdentifier: record.globalIdentifier || `AJA-GOLD-${Date.now().toString().slice(-4)}`,
      sourceSystemsSynced: record.sourceSystemsSynced || ['ERP', 'CRM'],
      dataSteward: record.dataSteward || 'Unassigned Data Steward',
      approvalStatus: 'PENDING_REVIEW',
      qualityScore: 92.0,
      versionHistoryCount: 1,
      lastUpdatedAt: new Date().toISOString(),
      attributes: record.attributes || {},
    };

    this.GOLDEN_RECORDS.unshift(newRecord);
    return newRecord;
  }

  public static getGovernancePolicies() {
    return [
      {
        policyId: 'GOV-POL-01',
        titleEn: 'Data Classification & Access Control Matrix (ISO 27001)',
        titleAr: 'مصفوفة تصنيف البيانات والتحكم بالوصول (ISO 27001)',
        classification: 'RESTRICTED',
        retentionYears: 7,
        complianceFrameworks: ['ISO 27001', 'ZATCA', 'Saudi NCA ECC'],
      },
      {
        policyId: 'GOV-POL-02',
        titleEn: 'Master Data Stewardship & Golden Record Approval Workflow',
        titleAr: 'دليل الإشراف على البيانات وسير اعتماد السجلات الذهبية',
        classification: 'INTERNAL',
        retentionYears: 10,
        complianceFrameworks: ['DAMA DMBOK2', 'GDPR'],
      },
      {
        policyId: 'GOV-POL-03',
        titleEn: 'AI Feature Store & Training Data Ethics & Privacy Policy',
        titleAr: 'سياسة أخلاقيات وخصوصية بيانات تدريب الذكاء الاصطناعي',
        classification: 'CONFIDENTIAL',
        retentionYears: 5,
        complianceFrameworks: ['SDAIA AI Ethics Framework', 'Saudi Personal Data Protection Law (PDPL)'],
      },
    ];
  }
}
