import {
  Company,
  Branch,
  Department,
  Team,
  CostCenter,
  ReportingTreeNode,
  OrganizationSettings,
  EmployeeAssignment,
} from '../types/organization';
import { getAdminFirestore } from '../server/firebaseAdmin';

// Initial Mock Data for High Availability & Enterprise Fallback
const DEFAULT_COMPANY: Company = {
  id: 'aja-holding',
  legalName: 'AJA Logistics & Supply Chain Solutions Co.',
  tradeName: 'AJA Logistics',
  commercialRegistration: '1010889201',
  vatNumber: '310098273400003',
  industry: 'Logistics & Multimodal Freight Transport',
  currency: 'SAR',
  fiscalYearStart: '01-01',
  timeZone: 'Asia/Riyadh',
  status: 'ACTIVE',
  defaultLanguage: 'ar',
  branding: {
    primaryColor: '#0F172A',
    secondaryColor: '#2563EB',
  },
  headOffice: {
    street: 'King Fahd Road, Olaya District, Tower 4, Fl 18',
    city: 'Riyadh',
    state: 'Riyadh Province',
    country: 'Saudi Arabia',
    postalCode: '12211',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'br-ruh-hq',
    code: 'RUH-HQ',
    name: 'Riyadh Central HQ & Logistics Hub',
    companyId: 'aja-holding',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    address: 'King Fahd Highway, Block 12, Olaya',
    managerName: 'Tareq Al-Mansoor',
    phone: '+966 11 200 4000',
    email: 'riyadh.hq@aja-logistics.com',
    warehouseId: 'wh-ruh-01',
    status: 'ACTIVE',
    timezone: 'Asia/Riyadh',
    isHeadquarters: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'br-jed-port',
    code: 'JED-PORT',
    name: 'Jeddah Islamic Port Gateway',
    companyId: 'aja-holding',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    address: 'Al-Baghdayyah Al-Gharbiyyah, Port Area Gate 5',
    managerName: 'Sami Al-Zahrani',
    phone: '+966 12 650 3300',
    email: 'jeddah.port@aja-logistics.com',
    warehouseId: 'wh-jed-02',
    status: 'ACTIVE',
    timezone: 'Asia/Riyadh',
    isHeadquarters: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'br-dmm-hub',
    code: 'DMM-HUB',
    name: 'Dammam Dammam Port & Freight Terminal',
    companyId: 'aja-holding',
    country: 'Saudi Arabia',
    city: 'Dammam',
    address: 'King Abdulaziz Port Highway, Zone B',
    managerName: 'Fahad Al-Hassan',
    phone: '+966 13 830 9922',
    email: 'dammam.hub@aja-logistics.com',
    warehouseId: 'wh-dmm-03',
    status: 'ACTIVE',
    timezone: 'Asia/Riyadh',
    isHeadquarters: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-exec',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    type: 'EXECUTIVE',
    name: 'Executive Office',
    nameAr: 'المكتب التنفيذي',
    managerName: 'Abdullah Al-Jaloud (CEO)',
    costCenterCode: 'CC-EXEC-001',
    employeeCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-ops',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    type: 'OPERATIONS',
    name: 'Global Freight Operations',
    nameAr: 'عمليات الشحن الدولي',
    managerName: 'Mansoor Al-Otaibi',
    costCenterCode: 'CC-OPS-100',
    employeeCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-fin',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    type: 'FINANCE',
    name: 'Finance & Accounting',
    nameAr: 'المالية والمحاسبة',
    managerName: 'Reem Al-Qahtani',
    costCenterCode: 'CC-FIN-200',
    employeeCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-wh',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    type: 'WAREHOUSE',
    name: 'Warehouse & Fulfillment',
    nameAr: 'إدارة المستودعات والتنفيذ',
    managerName: 'Khalid Al-Ghamdi',
    costCenterCode: 'CC-WH-300',
    employeeCount: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-fleet',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    type: 'FLEET',
    name: 'Fleet & Dispatch Management',
    nameAr: 'إدارة الأسطول والتوزيع',
    managerName: 'Nasser Al-Subaie',
    costCenterCode: 'CC-FLEET-400',
    employeeCount: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-customs',
    companyId: 'aja-holding',
    branchId: 'br-jed-port',
    type: 'CUSTOMS',
    name: 'Customs Clearance & Compliance',
    nameAr: 'التخليص الجمركي والامتثال',
    managerName: 'Hisham Al-Harbi',
    costCenterCode: 'CC-CUST-500',
    employeeCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-air-freight',
    departmentId: 'dept-ops',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    name: 'Air Freight Express Team',
    leaderName: 'Youssef Al-Enezi',
    memberIds: ['emp-101', 'emp-102', 'emp-103'],
    kpis: ['On-time Delivery > 98%', 'Customs clearance < 4 hrs'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'team-ocean-freight',
    departmentId: 'dept-ops',
    companyId: 'aja-holding',
    branchId: 'br-jed-port',
    name: 'Ocean & Port Operations Team',
    leaderName: 'Majed Al-Mutairi',
    memberIds: ['emp-201', 'emp-202'],
    kpis: ['Demurrage Zero Target', 'Container Turnaround < 24 hrs'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'team-last-mile',
    departmentId: 'dept-fleet',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    name: 'Riyadh Last Mile Dispatch Team',
    leaderName: 'Faisal Al-Sheri',
    memberIds: ['emp-301', 'emp-302', 'emp-303', 'emp-304'],
    kpis: ['Daily Delivery Success Rate > 99%'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_COST_CENTERS: CostCenter[] = [
  {
    id: 'cc-101',
    code: 'CC-OPS-100',
    name: 'Operations & Logistics Cost Center',
    type: 'DEPARTMENT',
    companyId: 'aja-holding',
    departmentId: 'dept-ops',
    budgetAllocated: 5000000,
    budgetSpent: 1850000,
    currency: 'SAR',
    managerName: 'Mansoor Al-Otaibi',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cc-201',
    code: 'CC-FIN-200',
    name: 'Corporate Finance & Tax Cost Center',
    type: 'CORPORATE',
    companyId: 'aja-holding',
    departmentId: 'dept-fin',
    budgetAllocated: 1200000,
    budgetSpent: 420000,
    currency: 'SAR',
    managerName: 'Reem Al-Qahtani',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cc-301',
    code: 'CC-WH-300',
    name: 'Warehousing Hubs Cost Center',
    type: 'BRANCH',
    companyId: 'aja-holding',
    branchId: 'br-ruh-hq',
    budgetAllocated: 3500000,
    budgetSpent: 1400000,
    currency: 'SAR',
    managerName: 'Khalid Al-Ghamdi',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: OrganizationSettings = {
  companyId: 'aja-holding',
  workingDays: ['SUN', 'MON', 'TUE', 'WED', 'THU'],
  weekendDays: ['FRI', 'SAT'],
  businessHours: {
    start: '08:00',
    end: '17:00',
  },
  holidays: [
    { id: 'h1', name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2026-09-23', isRecurring: true },
    { id: 'h2', name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2026-02-22', isRecurring: true },
    { id: 'h3', name: 'Eid Al-Fitr Holiday', nameAr: 'إجازة عيد الفطر المبارك', date: '2026-03-20', isRecurring: false },
    { id: 'h4', name: 'Eid Al-Adha Holiday', nameAr: 'إجازة عيد الأضحى المبارك', date: '2026-05-27', isRecurring: false },
  ],
  regionalSettings: {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    numberFormat: 'en-US',
  },
  fiscalCalendar: {
    startMonth: 1,
    taxReportingPeriod: 'QUARTERLY',
  },
};

const DEFAULT_REPORTING_TREE: ReportingTreeNode = {
  id: 'usr-ceo',
  fullName: 'Abdullah Al-Jaloud',
  position: 'Chief Executive Officer (CEO)',
  role: 'CEO',
  email: 'ceo@aja-logistics.com',
  departmentName: 'Executive Office',
  subordinates: [
    {
      id: 'usr-coo',
      fullName: 'Sultan Al-Dosari',
      position: 'Chief Operating Officer (COO)',
      role: 'COO',
      email: 'coo@aja-logistics.com',
      departmentName: 'Global Operations',
      subordinates: [
        {
          id: 'usr-ops-mgr',
          fullName: 'Mansoor Al-Otaibi',
          position: 'Operations Manager',
          role: 'OPERATIONS_MANAGER',
          email: 'm.otaibi@aja-logistics.com',
          departmentName: 'Freight Operations',
          subordinates: [
            {
              id: 'usr-disp-1',
              fullName: 'Ahmad Al-Ghamdi',
              position: 'Lead Senior Dispatcher',
              role: 'DISPATCHER',
              email: 'a.ghamdi@aja-logistics.com',
              subordinates: [],
            },
          ],
        },
        {
          id: 'usr-wh-mgr',
          fullName: 'Khalid Al-Ghamdi',
          position: 'Warehouse & Logistics Manager',
          role: 'WAREHOUSE_MANAGER',
          email: 'k.ghamdi@aja-logistics.com',
          departmentName: 'Fulfillment',
          subordinates: [],
        },
      ],
    },
    {
      id: 'usr-cfo',
      fullName: 'Noura Al-Otaibi',
      position: 'Chief Financial Officer (CFO)',
      role: 'CFO',
      email: 'cfo@aja-logistics.com',
      departmentName: 'Finance',
      subordinates: [
        {
          id: 'usr-fin-mgr',
          fullName: 'Reem Al-Qahtani',
          position: 'Finance & Treasury Manager',
          role: 'FINANCE_MANAGER',
          email: 'r.qahtani@aja-logistics.com',
          subordinates: [],
        },
      ],
    },
  ],
};

const LOCAL_COMPANY_ALIASES = new Set(['aja-holding', 'cmp_aja_1', 'cmp_horizon_1']);

function isLocalOrganizationFallbackEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    return process.env.DISABLE_LOCAL_ORG_FALLBACK !== 'true';
  }

  if (typeof window !== 'undefined') {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }

  return false;
}

function matchesFallbackCompany(companyId?: string | null): boolean {
  return !companyId || LOCAL_COMPANY_ALIASES.has(companyId);
}

function withRequestedCompany(companyId: string, company: Company = DEFAULT_COMPANY): Company {
  return {
    ...company,
    id: matchesFallbackCompany(companyId) ? companyId : company.id,
  };
}

function fallbackBranches(companyId: string): Branch[] {
  if (!matchesFallbackCompany(companyId)) return [];
  return DEFAULT_BRANCHES.map((branch) => ({ ...branch, companyId }));
}

function fallbackDepartments(companyId: string, branchId?: string): Department[] {
  if (!matchesFallbackCompany(companyId)) return [];

  return DEFAULT_DEPARTMENTS.map((department) => ({ ...department, companyId })).filter((department) => {
    if (!branchId) return true;
    return !department.branchId || department.branchId === branchId;
  });
}

function fallbackCostCenters(companyId: string): CostCenter[] {
  if (!matchesFallbackCompany(companyId)) return [];
  return DEFAULT_COST_CENTERS.map((costCenter) => ({ ...costCenter, companyId }));
}

function fallbackSettings(companyId: string): OrganizationSettings {
  return {
    ...DEFAULT_SETTINGS,
    companyId: matchesFallbackCompany(companyId) ? companyId : DEFAULT_SETTINGS.companyId,
  };
}

export class OrganizationService {
  /**
   * Fetches Company details from Firestore or fallback
   */
  public static async getCompany(companyId: string = 'aja-holding'): Promise<Company> {
    if (isLocalOrganizationFallbackEnabled()) {
      return withRequestedCompany(companyId);
    }

    try {
      const snap = await getAdminFirestore().collection('companies').doc(companyId).get();
      if (snap.exists) {
        return snap.data() as Company;
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore fetch fallback:', e);
    }
    return withRequestedCompany(companyId);
  }

  /**
   * Fetches all Branches for a Company
   */
  public static async getBranches(companyId: string = 'aja-holding'): Promise<Branch[]> {
    if (isLocalOrganizationFallbackEnabled()) {
      return fallbackBranches(companyId);
    }

    try {
      const snap = await getAdminFirestore().collection('branches').get();
      if (!snap.empty) {
        const branches = snap.docs.map((d) => d.data() as Branch);
        const filtered = branches.filter((b) => b.companyId === companyId);
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore branches fallback:', e);
    }
    return fallbackBranches(companyId);
  }

  /**
   * Fetches all Departments
   */
  public static async getDepartments(companyId: string = 'aja-holding', branchId?: string): Promise<Department[]> {
    if (isLocalOrganizationFallbackEnabled()) {
      return fallbackDepartments(companyId, branchId);
    }

    try {
      const snap = await getAdminFirestore().collection('departments').get();
      if (!snap.empty) {
        let depts = snap.docs.map((d) => d.data() as Department);
        depts = depts.filter((d) => d.companyId === companyId);
        if (branchId) {
          depts = depts.filter((d) => !d.branchId || d.branchId === branchId);
        }
        if (depts.length > 0) return depts;
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore departments fallback:', e);
    }

    return fallbackDepartments(companyId, branchId);
  }

  /**
   * Fetches all Teams
   */
  public static async getTeams(departmentId?: string): Promise<Team[]> {
    if (isLocalOrganizationFallbackEnabled()) {
      return departmentId ? DEFAULT_TEAMS.filter((t) => t.departmentId === departmentId) : DEFAULT_TEAMS;
    }

    try {
      const snap = await getAdminFirestore().collection('teams').get();
      if (!snap.empty) {
        const teams = snap.docs.map((d) => d.data() as Team);
        if (departmentId) {
          return teams.filter((t) => t.departmentId === departmentId);
        }
        return teams;
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore teams fallback:', e);
    }

    if (departmentId) {
      return DEFAULT_TEAMS.filter((t) => t.departmentId === departmentId);
    }
    return DEFAULT_TEAMS;
  }

  /**
   * Fetches Cost Centers
   */
  public static async getCostCenters(companyId: string = 'aja-holding'): Promise<CostCenter[]> {
    if (isLocalOrganizationFallbackEnabled()) {
      return fallbackCostCenters(companyId);
    }

    try {
      const snap = await getAdminFirestore().collection('cost_centers').get();
      if (!snap.empty) {
        const ccs = snap.docs.map((d) => d.data() as CostCenter);
        return ccs.filter((c) => c.companyId === companyId);
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore cost centers fallback:', e);
    }
    return fallbackCostCenters(companyId);
  }

  /**
   * Gets Organization Reporting Hierarchy Tree
   */
  public static async getReportingHierarchy(): Promise<ReportingTreeNode> {
    return DEFAULT_REPORTING_TREE;
  }

  /**
   * Gets Organization Settings
   */
  public static async getSettings(companyId: string = 'aja-holding'): Promise<OrganizationSettings> {
    if (isLocalOrganizationFallbackEnabled()) {
      return fallbackSettings(companyId);
    }

    try {
      const snap = await getAdminFirestore().collection('organization_settings').doc(companyId).get();
      if (snap.exists) {
        return snap.data() as OrganizationSettings;
      }
    } catch (e) {
      console.warn('[OrganizationService] Firestore settings fallback:', e);
    }
    return fallbackSettings(companyId);
  }

  /**
   * Save or update Branch
   */
  public static async saveBranch(branch: Partial<Branch> & { id: string }): Promise<Branch> {
    const fullBranch: Branch = {
      ...DEFAULT_BRANCHES[0],
      ...branch,
      updatedAt: new Date().toISOString(),
    };
    if (isLocalOrganizationFallbackEnabled()) {
      return fullBranch;
    }

    try {
      await getAdminFirestore().collection('branches').doc(fullBranch.id).set(fullBranch, { merge: true });
    } catch (e) {
      console.warn('[OrganizationService] Save branch error:', e);
    }
    return fullBranch;
  }

  /**
   * Save or update Department
   */
  public static async saveDepartment(dept: Partial<Department> & { id: string }): Promise<Department> {
    const fullDept: Department = {
      ...DEFAULT_DEPARTMENTS[0],
      ...dept,
      updatedAt: new Date().toISOString(),
    };
    if (isLocalOrganizationFallbackEnabled()) {
      return fullDept;
    }

    try {
      await getAdminFirestore().collection('departments').doc(fullDept.id).set(fullDept, { merge: true });
    } catch (e) {
      console.warn('[OrganizationService] Save department error:', e);
    }
    return fullDept;
  }
}
