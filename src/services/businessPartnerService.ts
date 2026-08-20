import { 
  BusinessPartner, 
  BPRole, 
  BPStatus, 
  BPClassification, 
  BPContact, 
  BPAddress, 
  BPBankAccount, 
  BPDocument, 
  BPRelationship, 
  BPDuplicatePair, 
  BPAnalytics 
} from '../types/businessPartner';
import { AuditService } from './auditService';
import { EventBusService } from './eventBusService';

// Seed Initial Business Partners Data
const initialPartners: BusinessPartner[] = [
  {
    id: 'bp-001',
    bpNumber: 'BP-10001',
    organizationId: 'org-root-001',
    roles: ['CUSTOMER', 'VENDOR'],
    legalName: 'SABIC Supply Chain & Logistics Co.',
    tradingName: 'SABIC Logistics',
    arabicName: 'شركة سابك للإمداد والخدمات اللوجستية',
    englishName: 'SABIC Supply Chain & Logistics Co.',
    taxNumber: '300188920100003',
    vatNumber: '300188920100003',
    commercialRegistration: '1010029381',
    classification: 'ENTERPRISE',
    industry: 'Petrochemicals & Heavy Freight',
    businessSize: 'ENTERPRISE',
    preferredCurrency: 'SAR',
    preferredLanguage: 'ar',
    paymentTerms: 'NET_60',
    incoterms: 'DDP',
    status: 'ACTIVE',
    activationDate: '2024-01-01',
    owner: 'Fahad Al-Qahtani',
    dataSteward: 'Abdullah Al-Jaloud',
    tags: ['petrochemical', 'vip', 'hazmat', 'enterprise'],
    metadata: { accountManager: 'Sami Al-Omari', tier: 'PLATINUM' },
    contacts: [
      {
        id: 'c-001',
        name: 'Eng. Khalid Al-Ghamdi',
        jobTitle: 'VP Logistics & Freight Operations',
        department: 'Global Supply Chain',
        email: 'k.ghamdi@sabic.com',
        phone: '+966 11 225 9000',
        mobile: '+966 50 112 2334',
        whatsapp: '+966 50 112 2334',
        preferredLanguage: 'ar',
        roles: ['PRIMARY', 'OPERATIONS'],
        isPrimary: true,
        isEmergency: false
      },
      {
        id: 'c-002',
        name: 'Sarah Al-Shehri',
        jobTitle: 'Head of Billing & Settlement',
        department: 'Finance',
        email: 'billing.logistics@sabic.com',
        phone: '+966 11 225 9100',
        preferredLanguage: 'en',
        roles: ['BILLING'],
        isPrimary: false,
        isEmergency: false
      }
    ],
    addresses: [
      {
        id: 'a-001',
        type: 'HEAD_OFFICE',
        addressName: 'SABIC Global HQ Building',
        street: 'King Saud Road, Al Muta\'am District',
        city: 'Riyadh',
        stateRegion: 'Riyadh Province',
        postalCode: '11422',
        country: 'Saudi Arabia',
        isPrimary: true,
        geoCoordinates: { lat: 24.7136, lng: 46.6753 }
      },
      {
        id: 'a-002',
        type: 'WAREHOUSE',
        addressName: 'Jubail Industrial Logistics Hub',
        street: 'Industrial Area 3, Port Road',
        city: 'Jubail',
        stateRegion: 'Eastern Province',
        postalCode: '31951',
        country: 'Saudi Arabia',
        isPrimary: false
      }
    ],
    bankAccounts: [
      {
        id: 'b-001',
        bankName: 'Saudi National Bank (SNB)',
        branchName: 'Riyadh Corporate Centre',
        accountName: 'SABIC Logistics Operations',
        accountNumber: '201992837401',
        iban: 'SA0310000020199283740101',
        swift: 'NCBKSARIXXX',
        currency: 'SAR',
        isPrimary: true
      }
    ],
    credit: {
      creditLimit: 25000000,
      creditExposure: 8450000,
      creditRating: 'AAA',
      riskCategory: 'LOW',
      isOnCreditHold: false,
      paymentTerms: 'NET_60',
      incoterms: 'DDP',
      collectionStatus: 'NORMAL'
    },
    compliance: {
      kycStatus: 'VERIFIED',
      kycVerificationDate: '2025-01-15',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '1010029381',
      crExpiryDate: '2028-12-31',
      vatNumber: '300188920100003',
      taxCertificateNumber: 'TAX-SB-2025',
      licenses: [
        {
          id: 'lic-001',
          type: 'Hazmat Transport License',
          licenseNumber: 'TGA-HAZ-9921',
          issuingAuthority: 'Transport General Authority (TGA)',
          expiryDate: '2027-06-30',
          status: 'VALID'
        }
      ]
    },
    documents: [
      {
        id: 'doc-001',
        documentType: 'CR',
        title: 'Commercial Registration - SABIC Logistics',
        fileUrl: '/docs/sabic_cr_2025.pdf',
        version: 1,
        expiryDate: '2028-12-31',
        uploadedAt: '2025-01-15',
        uploadedBy: 'Abdullah Al-Jaloud'
      },
      {
        id: 'doc-002',
        documentType: 'VAT_CERTIFICATE',
        title: 'ZATCA VAT Certificate',
        fileUrl: '/docs/sabic_vat_2025.pdf',
        version: 1,
        uploadedAt: '2025-01-15',
        uploadedBy: 'Abdullah Al-Jaloud'
      }
    ],
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2025-02-01T10:30:00Z'
  },
  {
    id: 'bp-002',
    bpNumber: 'BP-10002',
    organizationId: 'org-root-001',
    roles: ['CARRIER', '3PL', 'FREIGHT_FORWARDER'],
    legalName: 'DHL Express Saudi Arabia Ltd.',
    tradingName: 'DHL Express',
    arabicName: 'شركة دي إتش إل إكسبرس السعودية المحدودة',
    englishName: 'DHL Express Saudi Arabia Ltd.',
    taxNumber: '310088273400003',
    vatNumber: '310088273400003',
    commercialRegistration: '1010889201',
    classification: 'ENTERPRISE',
    industry: 'Courier & International Express Logistics',
    businessSize: 'ENTERPRISE',
    preferredCurrency: 'SAR',
    preferredLanguage: 'en',
    paymentTerms: 'NET_30',
    incoterms: 'CPT',
    status: 'ACTIVE',
    activationDate: '2024-02-15',
    owner: 'Tariq Mansour',
    dataSteward: 'Abdullah Al-Jaloud',
    tags: ['air_freight', 'express', 'global_partner'],
    metadata: { partnerTier: 'GOLD', API_Integration: 'CONNECTED' },
    contacts: [
      {
        id: 'c-003',
        name: 'Mark Henderson',
        jobTitle: 'Key Account Manager - KSA',
        email: 'mark.henderson@dhl.com',
        phone: '+966 11 499 8888',
        preferredLanguage: 'en',
        roles: ['PRIMARY', 'OPERATIONS'],
        isPrimary: true,
        isEmergency: false
      }
    ],
    addresses: [
      {
        id: 'a-003',
        type: 'HEAD_OFFICE',
        addressName: 'DHL Express KSA Headquarters',
        street: 'Dammam Road, Exit 8',
        city: 'Riyadh',
        stateRegion: 'Riyadh Province',
        postalCode: '11564',
        country: 'Saudi Arabia',
        isPrimary: true
      }
    ],
    bankAccounts: [
      {
        id: 'b-002',
        bankName: 'Al Rajhi Bank',
        branchName: 'Corporate Express Branch',
        accountName: 'DHL Express Saudi Arabia',
        accountNumber: '445998271001',
        iban: 'SA488000044599827100101',
        swift: 'RJHI33XXXX',
        currency: 'SAR',
        isPrimary: true
      }
    ],
    credit: {
      creditLimit: 10000000,
      creditExposure: 3100000,
      creditRating: 'AA',
      riskCategory: 'LOW',
      isOnCreditHold: false,
      paymentTerms: 'NET_30',
      incoterms: 'CPT',
      collectionStatus: 'NORMAL'
    },
    compliance: {
      kycStatus: 'VERIFIED',
      kycVerificationDate: '2025-02-01',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '1010889201',
      crExpiryDate: '2027-10-15',
      vatNumber: '310088273400003',
      licenses: [
        {
          id: 'lic-002',
          type: 'Express Parcel Transport Permit',
          licenseNumber: 'GACA-EXP-0082',
          issuingAuthority: 'GACA & TGA',
          expiryDate: '2027-12-31',
          status: 'VALID'
        }
      ]
    },
    documents: [
      {
        id: 'doc-003',
        documentType: 'CR',
        title: 'CR - DHL Express KSA',
        fileUrl: '/docs/dhl_cr_2025.pdf',
        version: 1,
        uploadedAt: '2025-02-01',
        uploadedBy: 'Abdullah Al-Jaloud'
      }
    ],
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2025-02-01T11:00:00Z'
  },
  {
    id: 'bp-003',
    bpNumber: 'BP-10003',
    organizationId: 'org-root-001',
    roles: ['CUSTOMS_BROKER', 'SHIPPING_AGENT'],
    legalName: 'Al-Majdouie Logistics & Customs Clearance',
    tradingName: 'Almajdouie Logistics',
    arabicName: 'شركة المجدوعي للخدمات اللوجستية والتخليص الجمركي',
    englishName: 'Al-Majdouie Logistics & Customs Clearance',
    taxNumber: '300998273400003',
    vatNumber: '300998273400003',
    commercialRegistration: '2050012938',
    classification: 'ENTERPRISE',
    industry: 'Customs Clearance & Heavy Haulage',
    businessSize: 'LARGE',
    preferredCurrency: 'SAR',
    preferredLanguage: 'ar',
    paymentTerms: 'NET_30',
    incoterms: 'FOB',
    status: 'ACTIVE',
    activationDate: '2024-03-01',
    owner: 'Fahad Al-Qahtani',
    dataSteward: 'Abdullah Al-Jaloud',
    tags: ['customs', 'zatca_certified', 'ports'],
    metadata: { customsLicenseNo: 'ZATCA-CC-8821' },
    contacts: [
      {
        id: 'c-004',
        name: 'Saad Al-Majdouie',
        jobTitle: 'Director of Port Operations',
        email: 'saad@almajdouie.com',
        phone: '+966 13 811 2000',
        preferredLanguage: 'ar',
        roles: ['PRIMARY', 'OPERATIONS'],
        isPrimary: true,
        isEmergency: false
      }
    ],
    addresses: [
      {
        id: 'a-004',
        type: 'HEAD_OFFICE',
        addressName: 'Dammam Port Gate Office',
        street: 'King Abdulaziz Port District',
        city: 'Dammam',
        stateRegion: 'Eastern Province',
        postalCode: '31411',
        country: 'Saudi Arabia',
        isPrimary: true
      }
    ],
    bankAccounts: [
      {
        id: 'b-003',
        bankName: 'Riyad Bank',
        branchName: 'Dammam Main Branch',
        accountName: 'Almajdouie Customs Clearance',
        accountNumber: '108837482910',
        iban: 'SA122000010883748291001',
        swift: 'RIBLSARIXXX',
        currency: 'SAR',
        isPrimary: true
      }
    ],
    credit: {
      creditLimit: 5000000,
      creditExposure: 1200000,
      creditRating: 'A',
      riskCategory: 'LOW',
      isOnCreditHold: false,
      paymentTerms: 'NET_30',
      incoterms: 'FOB',
      collectionStatus: 'NORMAL'
    },
    compliance: {
      kycStatus: 'VERIFIED',
      kycVerificationDate: '2025-01-20',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '2050012938',
      crExpiryDate: '2028-05-10',
      vatNumber: '300998273400003',
      licenses: [
        {
          id: 'lic-003',
          type: 'ZATCA Authorized Customs Broker License',
          licenseNumber: 'ZATCA-BROKER-0012',
          issuingAuthority: 'Zakat, Tax and Customs Authority',
          expiryDate: '2028-01-01',
          status: 'VALID'
        }
      ]
    },
    documents: [],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2025-01-20T12:00:00Z'
  },
  {
    id: 'bp-004',
    bpNumber: 'BP-10004',
    organizationId: 'org-root-001',
    roles: ['GOVERNMENT_AGENCY'],
    legalName: 'Zakat, Tax and Customs Authority (ZATCA)',
    tradingName: 'ZATCA',
    arabicName: 'هيئة الزكاة والضريبة والجمارك',
    englishName: 'Zakat, Tax and Customs Authority (ZATCA)',
    taxNumber: '300000000000003',
    vatNumber: '300000000000003',
    commercialRegistration: '1010000001',
    classification: 'GOVERNMENT',
    industry: 'Government Regulatory & Customs Authority',
    businessSize: 'ENTERPRISE',
    preferredCurrency: 'SAR',
    preferredLanguage: 'ar',
    paymentTerms: 'IMMEDIATE',
    incoterms: 'EXW',
    status: 'ACTIVE',
    activationDate: '2024-01-01',
    owner: 'Compliance Dept',
    dataSteward: 'Abdullah Al-Jaloud',
    tags: ['government', 'zatca', 'customs_authority'],
    metadata: { portalIntegration: 'ACTIVE', eInvoicingFatoora: 'PHASE_2_READY' },
    contacts: [
      {
        id: 'c-005',
        name: 'ZATCA Enterprise Support',
        jobTitle: 'Customs Clearance Integration Helpdesk',
        email: 'info@zatca.gov.sa',
        phone: '19993',
        preferredLanguage: 'ar',
        roles: ['PRIMARY', 'LEGAL'],
        isPrimary: true,
        isEmergency: true
      }
    ],
    addresses: [
      {
        id: 'a-005',
        type: 'HEAD_OFFICE',
        addressName: 'ZATCA Headquarters',
        street: 'King Abdulaziz Road',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        isPrimary: true
      }
    ],
    bankAccounts: [],
    credit: {
      creditLimit: 0,
      creditExposure: 0,
      creditRating: 'AAA',
      riskCategory: 'LOW',
      isOnCreditHold: false,
      paymentTerms: 'IMMEDIATE',
      incoterms: 'EXW',
      collectionStatus: 'NORMAL'
    },
    compliance: {
      kycStatus: 'VERIFIED',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '1010000001',
      vatNumber: '300000000000003',
      licenses: []
    },
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

const initialRelationships: BPRelationship[] = [
  {
    id: 'bprel-001',
    sourceBpId: 'bp-001',
    sourceBpName: 'SABIC Supply Chain & Logistics Co.',
    targetBpId: 'bp-002',
    targetBpName: 'DHL Express Saudi Arabia Ltd.',
    relationshipType: 'VENDOR_CUSTOMER',
    description: 'Exclusive Air & Express Freight service provider contract for SABIC Global Offices.',
    effectiveDate: '2024-02-01',
    status: 'ACTIVE'
  },
  {
    id: 'bprel-002',
    sourceBpId: 'bp-001',
    sourceBpName: 'SABIC Supply Chain & Logistics Co.',
    targetBpId: 'bp-003',
    targetBpName: 'Al-Majdouie Logistics & Customs Clearance',
    relationshipType: 'CARRIER_CUSTOMER',
    description: 'Customs clearance and port handling partner at King Abdulaziz Port Dammam.',
    effectiveDate: '2024-03-01',
    status: 'ACTIVE'
  }
];

const initialDuplicates: BPDuplicatePair[] = [
  {
    id: 'dup-001',
    partnerAId: 'bp-001',
    partnerAName: 'SABIC Supply Chain & Logistics Co.',
    partnerBId: 'bp-005',
    partnerBName: 'Saudi Basic Industries Corp (Logistics Division)',
    similarityScore: 88,
    matchReason: 'Matching Commercial Registration & Tax VAT number (300188920100003)',
    status: 'OPEN',
    detectedAt: '2025-02-02T14:20:00Z'
  }
];

class BusinessPartnerServiceClass {
  private partners: BusinessPartner[] = [...initialPartners];
  private relationships: BPRelationship[] = [...initialRelationships];
  private duplicates: BPDuplicatePair[] = [...initialDuplicates];

  public async getPartners(query?: {
    search?: string;
    role?: BPRole;
    status?: BPStatus;
    classification?: BPClassification;
  }): Promise<BusinessPartner[]> {
    let result = [...this.partners];

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        p =>
          p.bpNumber.toLowerCase().includes(q) ||
          p.legalName.toLowerCase().includes(q) ||
          p.tradingName.toLowerCase().includes(q) ||
          p.arabicName.includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          p.commercialRegistration.includes(q) ||
          p.vatNumber.includes(q)
      );
    }

    if (query?.role) {
      result = result.filter(p => p.roles.includes(query.role!));
    }

    if (query?.status) {
      result = result.filter(p => p.status === query.status);
    }

    if (query?.classification) {
      result = result.filter(p => p.classification === query.classification);
    }

    return result;
  }

  public async getPartnerById(id: string): Promise<BusinessPartner | null> {
    const found = this.partners.find(p => p.id === id);
    return found || null;
  }

  public async createPartner(data: Partial<BusinessPartner>, userId: string = 'admin'): Promise<BusinessPartner> {
    const newId = `bp-${Date.now()}`;
    const nextNum = 10000 + this.partners.length + 1;
    const bpNumber = `BP-${nextNum}`;

    const newPartner: BusinessPartner = {
      id: newId,
      bpNumber,
      organizationId: data.organizationId || 'org-root-001',
      roles: data.roles || ['CUSTOMER'],
      legalName: data.legalName || 'New Enterprise Partner',
      tradingName: data.tradingName || data.legalName || 'New Partner',
      arabicName: data.arabicName || 'شريك أعمال جديد',
      englishName: data.englishName || data.legalName || 'New Partner',
      taxNumber: data.taxNumber || '',
      vatNumber: data.vatNumber || '',
      commercialRegistration: data.commercialRegistration || '',
      classification: data.classification || 'CORPORATE',
      industry: data.industry || 'Logistics & Trade',
      businessSize: data.businessSize || 'MEDIUM',
      preferredCurrency: data.preferredCurrency || 'SAR',
      preferredLanguage: data.preferredLanguage || 'ar',
      paymentTerms: data.paymentTerms || 'NET_30',
      incoterms: data.incoterms || 'DDP',
      status: data.status || 'ACTIVE',
      activationDate: data.activationDate || new Date().toISOString().split('T')[0],
      owner: data.owner || userId,
      dataSteward: data.dataSteward || 'Abdullah Al-Jaloud',
      tags: data.tags || ['new_partner'],
      metadata: data.metadata || {},
      contacts: data.contacts || [],
      addresses: data.addresses || [],
      bankAccounts: data.bankAccounts || [],
      credit: data.credit || {
        creditLimit: 1000000,
        creditExposure: 0,
        creditRating: 'A',
        riskCategory: 'LOW',
        isOnCreditHold: false,
        paymentTerms: 'NET_30',
        incoterms: 'DDP',
        collectionStatus: 'NORMAL'
      },
      compliance: data.compliance || {
        kycStatus: 'PENDING',
        amlCheckStatus: 'CLEAR',
        sanctionsStatus: 'CLEAR',
        commercialRegistration: data.commercialRegistration || '',
        vatNumber: data.vatNumber || '',
        licenses: []
      },
      documents: data.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.partners.unshift(newPartner);

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'BusinessPartner',
      entityId: newPartner.id,
      severity: 'INFO',
      description: `Created Business Partner Master record [${newPartner.bpNumber}] - ${newPartner.legalName}`
    });

    await EventBusService.publish({
      name: 'BusinessPartnerCreated',
      aggregateId: newPartner.id,
      aggregateType: 'BusinessPartner',
      module: 'MDM' as any,
      priority: 'HIGH',
      payload: { bpId: newPartner.id, bpNumber: newPartner.bpNumber, roles: newPartner.roles }
    });

    return newPartner;
  }

  public async updatePartner(
    id: string,
    updates: Partial<BusinessPartner>,
    userId: string = 'admin',
    reason?: string
  ): Promise<BusinessPartner> {
    const index = this.partners.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Business Partner [${id}] not found.`);
    }

    const current = this.partners[index];
    const updated: BusinessPartner = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.partners[index] = updated;

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'BusinessPartner',
      entityId: id,
      severity: 'INFO',
      description: `Updated Business Partner [${updated.bpNumber}] - Reason: ${reason || 'Updates applied'}`
    });

    await EventBusService.publish({
      name: 'BusinessPartnerUpdated',
      aggregateId: id,
      aggregateType: 'BusinessPartner',
      module: 'MDM' as any,
      priority: 'NORMAL',
      payload: { bpId: id, bpNumber: updated.bpNumber }
    });

    return updated;
  }

  public async deletePartner(id: string, userId: string = 'admin'): Promise<boolean> {
    const index = this.partners.findIndex(p => p.id === id);
    if (index === -1) return false;

    const partner = this.partners[index];
    this.partners.splice(index, 1);

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'BusinessPartner',
      entityId: id,
      severity: 'CRITICAL',
      description: `Deleted Business Partner [${partner.bpNumber}] - ${partner.legalName}`
    });

    return true;
  }

  // Contacts Sub-resource
  public async addContact(bpId: string, contact: Omit<BPContact, 'id'>, userId: string = 'admin'): Promise<BPContact> {
    const partner = await this.getPartnerById(bpId);
    if (!partner) throw new Error('Partner not found');

    const newContact: BPContact = {
      ...contact,
      id: `c-${Date.now()}`
    };

    partner.contacts.push(newContact);
    await this.updatePartner(bpId, { contacts: partner.contacts }, userId, 'Added Contact');
    return newContact;
  }

  // Address Sub-resource
  public async addAddress(bpId: string, address: Omit<BPAddress, 'id'>, userId: string = 'admin'): Promise<BPAddress> {
    const partner = await this.getPartnerById(bpId);
    if (!partner) throw new Error('Partner not found');

    const newAddress: BPAddress = {
      ...address,
      id: `a-${Date.now()}`
    };

    partner.addresses.push(newAddress);
    await this.updatePartner(bpId, { addresses: partner.addresses }, userId, 'Added Address');
    return newAddress;
  }

  // Relationships
  public async getRelationships(bpId?: string): Promise<BPRelationship[]> {
    if (!bpId) return this.relationships;
    return this.relationships.filter(r => r.sourceBpId === bpId || r.targetBpId === bpId);
  }

  public async createRelationship(rel: Omit<BPRelationship, 'id'>, userId: string = 'admin'): Promise<BPRelationship> {
    const newRel: BPRelationship = {
      ...rel,
      id: `bprel-${Date.now()}`
    };
    this.relationships.unshift(newRel);

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'BPRelationship',
      entityId: newRel.id,
      severity: 'INFO',
      description: `Linked Business Partners: ${newRel.sourceBpName} <-> ${newRel.targetBpName} (${newRel.relationshipType})`
    });

    return newRel;
  }

  // Duplicates & Merge
  public async getDuplicates(): Promise<BPDuplicatePair[]> {
    return this.duplicates;
  }

  public async resolveDuplicate(
    id: string,
    action: 'MERGE' | 'DISMISS',
    targetBpId?: string,
    userId: string = 'admin'
  ): Promise<boolean> {
    const index = this.duplicates.findIndex(d => d.id === id);
    if (index === -1) return false;

    this.duplicates[index].status = action === 'MERGE' ? 'MERGED' : 'DISMISSED';

    await AuditService.logAudit({
      actorId: userId,
      actorEmail: `${userId}@aja-logistics.com`,
      action: 'WORKFLOW_CHANGE',
      module: 'MDM',
      entityType: 'BPDuplicatePair',
      entityId: id,
      severity: 'INFO',
      description: `Resolved Business Partner Duplicate [${id}] via ${action}`
    });

    return true;
  }

  // Analytics
  public async getAnalytics(): Promise<BPAnalytics> {
    const totalPartners = this.partners.length;
    const activePartners = this.partners.filter(p => p.status === 'ACTIVE').length;
    const totalCreditLimit = this.partners.reduce((acc, p) => acc + (p.credit?.creditLimit || 0), 0);
    const totalCreditExposure = this.partners.reduce((acc, p) => acc + (p.credit?.creditExposure || 0), 0);

    const kycVerifiedCount = this.partners.filter(p => p.compliance?.kycStatus === 'VERIFIED').length;
    const kycPendingCount = this.partners.filter(p => p.compliance?.kycStatus === 'PENDING').length;

    const roleBreakdown: Record<BPRole, number> = {
      CUSTOMER: 0,
      VENDOR: 0,
      SUPPLIER: 0,
      CARRIER: 0,
      FREIGHT_FORWARDER: 0,
      CUSTOMS_BROKER: 0,
      SHIPPING_AGENT: 0,
      WAREHOUSE_PROVIDER: 0,
      INSURANCE_PROVIDER: 0,
      FINANCIAL_INSTITUTION: 0,
      GOVERNMENT_AGENCY: 0,
      CONTRACTOR: 0,
      CONSULTANT: 0,
      AGENT: 0,
      '3PL': 0,
      '4PL': 0,
      PARTNER: 0
    };

    this.partners.forEach(p => {
      p.roles.forEach(r => {
        if (roleBreakdown[r] !== undefined) roleBreakdown[r]++;
      });
    });

    const riskBreakdown: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    this.partners.forEach(p => {
      const r = p.credit?.riskCategory || 'LOW';
      riskBreakdown[r] = (riskBreakdown[r] || 0) + 1;
    });

    const statusBreakdown: Record<string, number> = {
      DRAFT: 0,
      ACTIVE: 0,
      ON_HOLD: 0,
      SUSPENDED: 0,
      BLACK_LISTED: 0,
      ARCHIVED: 0
    };
    this.partners.forEach(p => {
      statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1;
    });

    return {
      totalPartners,
      activePartners,
      totalCreditLimit,
      totalCreditExposure,
      kycVerifiedCount,
      kycPendingCount,
      roleBreakdown,
      riskBreakdown: riskBreakdown as any,
      statusBreakdown: statusBreakdown as any
    };
  }
}

export const BusinessPartnerService = new BusinessPartnerServiceClass();
