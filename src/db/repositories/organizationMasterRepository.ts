import { 
  MasterOrganizationNode, 
  OrganizationRelationship, 
  OrganizationVersionRecord, 
  OrganizationMasterAnalytics 
} from '../../types/organizationMaster';
import { getAdminFirestore } from '../../server/firebaseAdmin';

function useLocalOrganizationMasterStore(): boolean {
  return (
    process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
  );
}

const DEFAULT_ORG_NODES: MasterOrganizationNode[] = [
  {
    id: 'org-holding-001',
    code: 'AJA-HOLDING',
    name: 'AJA Logistics Group Holding Co.',
    nameAr: 'مجموعة عجة اللوجستية القابضة',
    shortName: 'AJA Group',
    type: 'HOLDING_COMPANY',
    parentId: null,
    depth: 0,
    lineagePath: '/org-holding-001',
    legalEntity: {
      legalEntityId: 'le-holding-101',
      legalName: 'AJA Logistics Holding Closed Joint Stock Co.',
      tradeName: 'AJA Group Holding',
      commercialRegistration: '1010009988',
      vatNumber: '300011223300003',
      taxRegistrationDate: '2020-01-01',
      incorporationCountry: 'Saudi Arabia',
      licenses: [
        {
          licenseNumber: 'LIC-GAFT-2020-01',
          issuingAuthority: 'General Authority of Foreign Trade',
          expiryDate: '2028-12-31',
          type: 'Investment & Holding License'
        }
      ]
    },
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'King Fahd Highway, Olaya District, Tower 4, Floor 25',
      postalCode: '12211',
      latitude: 24.7136,
      longitude: 46.6753
    },
    financial: {
      costCenterId: 'cc-corp-001',
      costCenterCode: 'CC-CORP-001',
      costCenterName: 'Corporate Holding Executive',
      profitCenterId: 'pc-group-001',
      profitCenterCode: 'PC-GROUP-001',
      responsibilityCenter: 'Board & Executive Office',
      budgetAllocated: 25000000,
      budgetSpent: 8400000,
      currency: 'SAR',
      budgetOwnerName: 'Abdullah Al-Jaloud'
    },
    phone: '+966 11 200 4000',
    email: 'holding@aja-logistics.com',
    website: 'https://aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2020-01-01',
    version: 1,
    effectiveDate: '2020-01-01',
    dataSteward: 'Abdullah Al-Jaloud (Chief Executive)',
    tags: ['holding', 'executive', 'corporate'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-sub-ksa-002',
    code: 'AJA-KSA',
    name: 'AJA Logistics KSA Operating Company',
    nameAr: 'شركة عجة للخدمات اللوجستية - السعودية',
    shortName: 'AJA KSA',
    type: 'SUBSIDIARY',
    parentId: 'org-holding-001',
    depth: 1,
    lineagePath: '/org-holding-001/org-sub-ksa-002',
    legalEntity: {
      legalEntityId: 'le-ksa-201',
      legalName: 'AJA Logistics Services Company LLC',
      tradeName: 'AJA Logistics KSA',
      commercialRegistration: '1010889201',
      vatNumber: '310098273400003',
      taxRegistrationDate: '2021-03-15',
      incorporationCountry: 'Saudi Arabia',
      licenses: [
        {
          licenseNumber: 'TGA-LOG-9921',
          issuingAuthority: 'Transport General Authority (TGA)',
          expiryDate: '2027-06-30',
          type: 'Freight Forwarding & Heavy Transport'
        }
      ]
    },
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'King Fahd Highway, Block 12, Olaya Tower',
      postalCode: '12211',
      latitude: 24.7136,
      longitude: 46.6753
    },
    financial: {
      costCenterId: 'cc-ksa-ops-100',
      costCenterCode: 'CC-KSA-OPS-100',
      costCenterName: 'KSA Operations Main',
      profitCenterId: 'pc-ksa-profit-101',
      profitCenterCode: 'PC-KSA-101',
      responsibilityCenter: 'KSA Country Management',
      budgetAllocated: 18000000,
      budgetSpent: 6200000,
      currency: 'SAR',
      budgetOwnerName: 'Tareq Al-Mansoor'
    },
    phone: '+966 11 200 4001',
    email: 'info.ksa@aja-logistics.com',
    website: 'https://aja-logistics.com/ksa',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-03-15',
    version: 1,
    effectiveDate: '2021-03-15',
    dataSteward: 'Tareq Al-Mansoor (Country Director)',
    tags: ['subsidiary', 'ksa', 'operations'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-sub-uae-003',
    code: 'AJA-UAE',
    name: 'AJA Express Logistics UAE FZ-LLC',
    nameAr: 'شركة عجة إكسبريس اللوجستية - الإمارات',
    shortName: 'AJA UAE',
    type: 'SUBSIDIARY',
    parentId: 'org-holding-001',
    depth: 1,
    lineagePath: '/org-holding-001/org-sub-uae-003',
    legalEntity: {
      legalEntityId: 'le-uae-301',
      legalName: 'AJA Express Logistics Middle East FZ-LLC',
      tradeName: 'AJA Logistics UAE',
      commercialRegistration: 'DWC-LICENSE-4821',
      vatNumber: '100293848500003',
      taxRegistrationDate: '2022-02-10',
      incorporationCountry: 'United Arab Emirates',
      licenses: [
        {
          licenseNumber: 'DIFC-LOG-8832',
          issuingAuthority: 'Dubai South Aviation & Logistics City',
          expiryDate: '2027-11-15',
          type: 'Free Zone Multimodal Forwarding'
        }
      ]
    },
    geographic: {
      country: 'United Arab Emirates',
      region: 'Dubai',
      city: 'Dubai',
      address: 'Dubai South, Logistics District, Building C2, Suite 402',
      postalCode: '00000',
      latitude: 24.8964,
      longitude: 55.1622
    },
    financial: {
      costCenterId: 'cc-uae-ops-200',
      costCenterCode: 'CC-UAE-OPS-200',
      costCenterName: 'UAE Regional Logistics Center',
      profitCenterId: 'pc-uae-profit-201',
      profitCenterCode: 'PC-UAE-201',
      responsibilityCenter: 'UAE Regional Office',
      budgetAllocated: 12000000,
      budgetSpent: 4100000,
      currency: 'AED',
      budgetOwnerName: 'Rashid Al-Maktoum'
    },
    phone: '+971 4 888 3920',
    email: 'uae@aja-logistics.com',
    website: 'https://aja-logistics.ae',
    timeZone: 'Asia/Dubai',
    currency: 'AED',
    defaultLanguage: 'en',
    status: 'ACTIVE',
    activationDate: '2022-02-10',
    version: 1,
    effectiveDate: '2022-02-10',
    dataSteward: 'Rashid Al-Maktoum (Regional GM)',
    tags: ['subsidiary', 'uae', 'dubai-south'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-reg-central-004',
    code: 'REG-CENTRAL',
    name: 'Central Region Command Office',
    nameAr: 'المكتب الإقليمي للمنطقة الوسطى',
    shortName: 'Central Reg',
    type: 'REGIONAL_OFFICE',
    parentId: 'org-sub-ksa-002',
    depth: 2,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-reg-central-004',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'Industrial Area 2, Command Hub B4',
      postalCode: '11543',
      operationalZone: 'Central Zone - Riyadh & Al-Kharj'
    },
    financial: {
      costCenterId: 'cc-reg-ruh-300',
      costCenterCode: 'CC-REG-RUH-300',
      costCenterName: 'Central Region Operational Admin',
      budgetAllocated: 6000000,
      budgetSpent: 2200000,
      currency: 'SAR',
      budgetOwnerName: 'Fahad Al-Subaie'
    },
    phone: '+966 11 200 4100',
    email: 'central.region@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-04-01',
    version: 1,
    effectiveDate: '2021-04-01',
    dataSteward: 'Fahad Al-Subaie',
    tags: ['regional', 'central', 'riyadh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-reg-western-005',
    code: 'REG-WESTERN',
    name: 'Western Region Maritime & Gateway Office',
    nameAr: 'المكتب الإقليمي للمنطقة الغربية والبحرية',
    shortName: 'Western Reg',
    type: 'REGIONAL_OFFICE',
    parentId: 'org-sub-ksa-002',
    depth: 2,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-reg-western-005',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Makkah Province',
      city: 'Jeddah',
      address: 'Al-Baghdayyah Al-Gharbiyyah, Port Gate 5',
      postalCode: '21432',
      operationalZone: 'Western Coast & Red Sea Ports'
    },
    financial: {
      costCenterId: 'cc-reg-jed-400',
      costCenterCode: 'CC-REG-JED-400',
      costCenterName: 'Western Maritime Regional Hub',
      budgetAllocated: 8000000,
      budgetSpent: 3100000,
      currency: 'SAR',
      budgetOwnerName: 'Sami Al-Zahrani'
    },
    phone: '+966 12 650 3300',
    email: 'western.region@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-05-01',
    version: 1,
    effectiveDate: '2021-05-01',
    dataSteward: 'Sami Al-Zahrani',
    tags: ['regional', 'western', 'jeddah', 'port'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-branch-ruh-006',
    code: 'BR-RUH-HQ',
    name: 'Riyadh Central Distribution & Freight Hub',
    nameAr: 'فرع المركز الرئيسي والفرز اللوجستي بالرياض',
    shortName: 'RUH Freight Hub',
    type: 'BRANCH',
    parentId: 'org-reg-central-004',
    depth: 3,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-reg-central-004/org-branch-ruh-006',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'Al-Sulai Industrial Area, Zone 3',
      postalCode: '14233',
      operationalZone: 'Greater Riyadh Metro'
    },
    financial: {
      costCenterId: 'cc-br-ruh-01',
      costCenterCode: 'CC-BR-RUH-01',
      costCenterName: 'Riyadh Main Branch Cost Center',
      profitCenterId: 'pc-ruh-01',
      profitCenterCode: 'PC-RUH-01',
      responsibilityCenter: 'Riyadh Branch Manager',
      budgetAllocated: 5500000,
      budgetSpent: 1950000,
      currency: 'SAR',
      budgetOwnerName: 'Mansoor Al-Otaibi'
    },
    phone: '+966 11 498 1100',
    email: 'ruh.branch@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-06-01',
    version: 1,
    effectiveDate: '2021-06-01',
    dataSteward: 'Mansoor Al-Otaibi',
    tags: ['branch', 'riyadh', 'freight-hub'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-wh-ruh-007',
    code: 'WH-RUH-COLD-01',
    name: 'Riyadh High-Tech Cold Chain Terminal',
    nameAr: 'مستودع التبريد العالي التقنية بالرياض',
    shortName: 'RUH Cold Wh',
    type: 'WAREHOUSE',
    parentId: 'org-branch-ruh-006',
    depth: 4,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-reg-central-004/org-branch-ruh-006/org-wh-ruh-007',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'Al-Kharj Road Exit 18, Block 8',
      postalCode: '14311',
      operationalZone: 'Pharma & Food Cold Chain Zone'
    },
    financial: {
      costCenterId: 'cc-wh-ruh-300',
      costCenterCode: 'CC-WH-300',
      costCenterName: 'Warehousing & Cold Storage',
      budgetAllocated: 3500000,
      budgetSpent: 1400000,
      currency: 'SAR',
      budgetOwnerName: 'Khalid Al-Ghamdi'
    },
    phone: '+966 11 498 1150',
    email: 'coldstorage.ruh@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-08-01',
    version: 1,
    effectiveDate: '2021-08-01',
    dataSteward: 'Khalid Al-Ghamdi',
    tags: ['warehouse', 'cold-chain', 'pharma'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-dept-ops-008',
    code: 'DEPT-OPS-KSA',
    name: 'Global Freight & Express Operations Division',
    nameAr: 'إدارة عمليات الشحن الدولي والإنهاء الجمركي',
    shortName: 'Freight Operations',
    type: 'DEPARTMENT',
    parentId: 'org-sub-ksa-002',
    depth: 2,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-dept-ops-008',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Riyadh Province',
      city: 'Riyadh',
      address: 'Olaya Tower, Floor 18'
    },
    financial: {
      costCenterId: 'cc-ops-100',
      costCenterCode: 'CC-OPS-100',
      costCenterName: 'Freight Operations Cost Center',
      profitCenterId: 'pc-ops-freight-100',
      profitCenterCode: 'PC-OPS-100',
      budgetAllocated: 5000000,
      budgetSpent: 1850000,
      currency: 'SAR',
      budgetOwnerName: 'Mansoor Al-Otaibi'
    },
    phone: '+966 11 200 4050',
    email: 'ops@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-03-15',
    version: 1,
    effectiveDate: '2021-03-15',
    dataSteward: 'Mansoor Al-Otaibi',
    tags: ['department', 'operations', 'freight'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'org-bu-customs-009',
    code: 'BU-CUSTOMS',
    name: 'Customs Clearance & Compliance Business Unit',
    nameAr: 'وحدة أعمال التخليص والامتثال الجمركي',
    shortName: 'Customs BU',
    type: 'BUSINESS_UNIT',
    parentId: 'org-dept-ops-008',
    depth: 3,
    lineagePath: '/org-holding-001/org-sub-ksa-002/org-dept-ops-008/org-bu-customs-009',
    geographic: {
      country: 'Saudi Arabia',
      region: 'Makkah Province',
      city: 'Jeddah',
      address: 'Jeddah Port Customs Plaza, Office 302'
    },
    financial: {
      costCenterId: 'cc-cust-500',
      costCenterCode: 'CC-CUST-500',
      costCenterName: 'Customs Compliance Center',
      profitCenterId: 'pc-cust-01',
      profitCenterCode: 'PC-CUST-01',
      budgetAllocated: 2800000,
      budgetSpent: 910000,
      currency: 'SAR',
      budgetOwnerName: 'Hisham Al-Harbi'
    },
    phone: '+966 12 650 3344',
    email: 'customs.bu@aja-logistics.com',
    timeZone: 'Asia/Riyadh',
    currency: 'SAR',
    defaultLanguage: 'ar',
    status: 'ACTIVE',
    activationDate: '2021-05-15',
    version: 1,
    effectiveDate: '2021-05-15',
    dataSteward: 'Hisham Al-Harbi',
    tags: ['business-unit', 'customs', 'compliance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_RELATIONSHIPS: OrganizationRelationship[] = [
  {
    id: 'rel-001',
    sourceOrgId: 'org-holding-001',
    sourceOrgName: 'AJA Logistics Group Holding Co.',
    targetOrgId: 'org-sub-ksa-002',
    targetOrgName: 'AJA Logistics KSA Operating Company',
    relationshipType: 'PARENT_CHILD',
    description: 'Direct 100% Equity Parent-Subsidiary ownership structure',
    effectiveDate: '2021-03-15',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rel-002',
    sourceOrgId: 'org-sub-ksa-002',
    sourceOrgName: 'AJA Logistics KSA Operating Company',
    targetOrgId: 'org-sub-uae-003',
    targetOrgName: 'AJA Express Logistics UAE FZ-LLC',
    relationshipType: 'SHARED_SERVICES',
    description: 'Shared IT Infrastructure, ERP, and Enterprise Customs Gateway Services',
    effectiveDate: '2022-02-10',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rel-003',
    sourceOrgId: 'org-bu-customs-009',
    sourceOrgName: 'Customs Clearance & Compliance Business Unit',
    targetOrgId: 'org-branch-ruh-006',
    targetOrgName: 'Riyadh Central Distribution & Freight Hub',
    relationshipType: 'INTERNAL_SUPPLIER',
    description: 'Provides priority air & sea customs clearance service to Riyadh hub shipments',
    effectiveDate: '2021-06-01',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

export class OrganizationMasterRepository {
  /**
   * Get all organization master nodes
   */
  public static async getNodes(): Promise<MasterOrganizationNode[]> {
    if (useLocalOrganizationMasterStore()) {
      return DEFAULT_ORG_NODES;
    }

    try {
      const snap = await getAdminFirestore().collection('enterprise_org_nodes').get();
      if (!snap.empty) {
        return snap.docs.map(doc => doc.data() as MasterOrganizationNode);
      }
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore fetch fallback:', e);
    }
    return DEFAULT_ORG_NODES;
  }

  /**
   * Get node by ID
   */
  public static async getNodeById(id: string): Promise<MasterOrganizationNode | null> {
    if (useLocalOrganizationMasterStore()) {
      const found = DEFAULT_ORG_NODES.find(n => n.id === id || n.legalEntity?.legalEntityId === id);
      return found || null;
    }

    try {
      const snap = await getAdminFirestore().collection('enterprise_org_nodes').doc(id).get();
      if (snap.exists) {
        return snap.data() as MasterOrganizationNode;
      }
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore getNodeById fallback:', e);
    }
    const found = DEFAULT_ORG_NODES.find(n => n.id === id || n.legalEntity?.legalEntityId === id);
    return found || null;
  }

  /**
   * Save or update an organization node
   */
  public static async saveNode(node: MasterOrganizationNode): Promise<MasterOrganizationNode> {
    if (useLocalOrganizationMasterStore()) {
      return node;
    }

    try {
      await getAdminFirestore().collection('enterprise_org_nodes').doc(node.id).set(node, { merge: true });
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore saveNode error:', e);
    }
    return node;
  }

  /**
   * Delete node
   */
  public static async deleteNode(id: string): Promise<boolean> {
    if (useLocalOrganizationMasterStore()) {
      return DEFAULT_ORG_NODES.some(n => n.id === id || n.legalEntity?.legalEntityId === id);
    }

    try {
      await getAdminFirestore().collection('enterprise_org_nodes').doc(id).delete();
      return true;
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore deleteNode error:', e);
      return false;
    }
  }

  /**
   * Get all cross-entity organization relationships
   */
  public static async getRelationships(): Promise<OrganizationRelationship[]> {
    if (useLocalOrganizationMasterStore()) {
      return DEFAULT_RELATIONSHIPS;
    }

    try {
      const snap = await getAdminFirestore().collection('enterprise_org_relationships').get();
      if (!snap.empty) {
        return snap.docs.map(doc => doc.data() as OrganizationRelationship);
      }
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore getRelationships fallback:', e);
    }
    return DEFAULT_RELATIONSHIPS;
  }

  /**
   * Save relationship
   */
  public static async saveRelationship(rel: OrganizationRelationship): Promise<OrganizationRelationship> {
    if (useLocalOrganizationMasterStore()) {
      return rel;
    }

    try {
      await getAdminFirestore().collection('enterprise_org_relationships').doc(rel.id).set(rel, { merge: true });
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore saveRelationship error:', e);
    }
    return rel;
  }

  /**
   * Save version history record
   */
  public static async saveVersion(versionRecord: OrganizationVersionRecord): Promise<void> {
    if (useLocalOrganizationMasterStore()) {
      return;
    }

    try {
      await getAdminFirestore().collection('enterprise_org_versions').doc(versionRecord.versionId).set(versionRecord);
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore saveVersion error:', e);
    }
  }

  /**
   * Get version history for node
   */
  public static async getVersions(orgId: string): Promise<OrganizationVersionRecord[]> {
    if (useLocalOrganizationMasterStore()) {
      return [];
    }

    try {
      const snap = await getAdminFirestore().collection('enterprise_org_versions').get();
      if (!snap.empty) {
        const records = snap.docs.map(d => d.data() as OrganizationVersionRecord);
        return records.filter(r => r.orgId === orgId).sort((a, b) => b.version - a.version);
      }
    } catch (e) {
      console.warn('[OrgMasterRepo] Firestore getVersions error:', e);
    }
    return [];
  }
}
