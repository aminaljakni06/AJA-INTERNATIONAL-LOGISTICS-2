import { getAdminFirestore } from '../server/firebaseAdmin';
import {
  ProductMaster,
  ServiceItem,
  ServicePackage,
  ShipmentTypeDefinition,
  AssetRecord,
  DigitalAssetRecord,
  VehicleRecord,
  ContainerRecord,
  EquipmentRecord,
  DriverResourceRecord,
  UomRecord,
  UomConversionRule,
  CommodityRecord,
  ResourceLifecycleStatus
} from '../types/productResourceMaster';
import { EventBusService } from './eventBusService';
import { AuditService } from './auditService';
import { db as localDb } from '../db/database';

// Initial Mock Seed Data
const MOCK_PRODUCTS: ProductMaster[] = [
  {
    id: 'prod_001',
    globalProductId: 'G-SKU-9901-SA',
    productCode: 'SKU-ELEC-SMART-01',
    sku: 'SKU-ELEC-SMART-01',
    barcode: '6281100998821',
    qrCode: 'AJA-QR-PROD-9901',
    rfidTag: 'RFID-E200-9981-A',
    nameAr: 'حساسات صناعية فائقة الدقة للحرارة والاهتزاز',
    nameEn: 'Industrial High-Precision Thermal & Vibration Sensors',
    shortDescriptionAr: 'حساسات إنترنت الأشياء المتقدمة للمستودعات الذكية',
    shortDescriptionEn: 'Advanced IoT sensors for smart warehouse monitoring',
    longDescriptionAr: 'وحدات استشعار متكاملة لمراقبة درجات الحرارة والاهتزازات في شحنات التبريد والمستودعات الفائقة الدقة',
    longDescriptionEn: 'Integrated sensor units for monitoring temperature and vibration in cold chain shipments and precision storage',
    commodityCategory: 'INDUSTRIAL_ELECTRONICS',
    hsCode: '9031.80.90',
    brand: 'AJA TechSense',
    model: 'TS-5000-PRO',
    serialNumber: 'SN-2026-90812',
    countryOfOrigin: 'SA',
    uom: 'PCS',
    weightKg: 0.45,
    volumeCbm: 0.002,
    dimensionsCm: { length: 15, width: 10, height: 8 },
    packagingType: 'BOX',
    temperatureClass: 'CONTROLLED_ROOM',
    isHazmat: false,
    status: 'ACTIVE',
    owner: 'Product Team',
    steward: 'Sultan Al-Otaibi',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_002',
    globalProductId: 'G-SKU-7720-SA',
    productCode: 'SKU-CHEM-POLY-02',
    sku: 'SKU-CHEM-POLY-02',
    barcode: '6281100554412',
    qrCode: 'AJA-QR-PROD-7720',
    rfidTag: 'RFID-E200-7720-B',
    nameAr: 'بوليمر بولي إيثيلين خالي من المواد السامة',
    nameEn: 'Industrial Non-Toxic Polyethylene Resin Granules',
    shortDescriptionAr: 'حبيبات بلاستيكية للتغليف عالي التحمل',
    shortDescriptionEn: 'Plastic resin granules for heavy-duty industrial packaging',
    commodityCategory: 'PETROCHEMICALS',
    hsCode: '3901.10.10',
    brand: 'SABIC Polymer',
    model: 'PE-HD-2026',
    countryOfOrigin: 'SA',
    uom: 'TON',
    weightKg: 1000,
    volumeCbm: 1.25,
    dimensionsCm: { length: 120, width: 100, height: 110 },
    packagingType: 'PALLET',
    temperatureClass: 'AMBIENT',
    isHazmat: true,
    unNumber: 'UN3077',
    hazmatClass: 'Class 9 Miscellaneous',
    shelfLifeDays: 730,
    status: 'ACTIVE',
    owner: 'Petrochem Division',
    steward: 'Khalid Mansoor',
    version: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'srv_001',
    serviceCode: 'SRV-AIR-EXP-PRIORITY',
    category: 'AIR_FREIGHT',
    nameAr: 'شحن جوي سريع فائق الأولوية',
    nameEn: 'Priority Express Air Freight',
    descriptionAr: 'خدمة نقل جوي سريع مع التخليص الجمركي الفوري في المطار خلال 12 ساعة',
    descriptionEn: 'Ultra-fast air cargo dispatch with express customs release at RUH/JED airports within 12 hours',
    baseCurrency: 'SAR',
    defaultRate: 18.5,
    rateUnit: 'PER_KG',
    leadTimeHours: 12,
    slaTermsAr: 'ضمان التوصيل في نفس اليوم لجميع مدن المملكة الرئيسية',
    slaTermsEn: 'Same-day delivery guarantee to major KSA commercial hubs',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_002',
    serviceCode: 'SRV-COLD-CHAIN-FULL',
    category: 'COLD_CHAIN',
    nameAr: 'شحن النطاق المبرد والأدوية',
    nameEn: 'Certified Pharma & Cold Chain Logistics',
    descriptionAr: 'خدمة النقل المبرد المعتمدة مع التتبع المباشر لدرجات الحرارة وضمان درجة الحرارة (-20°C إلى +4°C)',
    descriptionEn: 'Certified temperature-controlled transport for pharmaceuticals & medical supplies (-20°C to +4°C)',
    baseCurrency: 'SAR',
    defaultRate: 450,
    rateUnit: 'PER_PALLET',
    leadTimeHours: 24,
    slaTermsAr: 'التزام تام بمعايير SFDA ومراقبة الحرارة عبر الأقمار الصناعية',
    slaTermsEn: 'Full compliance with SFDA medical transport standards and live satellite temperature telemetry',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg_001',
    packageCode: 'PKG-3PL-COMPLETE',
    nameAr: 'باقة اللوجستيات الشاملة 3PL',
    nameEn: 'Complete 3PL Enterprise Fulfillment Package',
    descriptionAr: 'باقة مدمجة تشمل التخزين، التخليص الجمركي، التعبئة والنقل للميل الأخير مع خصم خاص',
    descriptionEn: 'Bundled suite covering bonded warehousing, customs brokerage, packaging, and last-mile distribution',
    includedServiceIds: ['srv_001', 'srv_002'],
    bundleDiscountPercentage: 15,
    targetMarket: 'Enterprise Retail & E-Commerce',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_SHIPMENT_TYPES: ShipmentTypeDefinition[] = [
  {
    id: 'st_001',
    code: 'DANGEROUS_GOODS',
    nameAr: 'البضائع والمواد الخطرة (Hazmat)',
    nameEn: 'Dangerous Goods & Chemical Cargo',
    descriptionAr: 'شحنات خاضعة لتنظيمات ADR / IATA DGR وتتطلب تصاريح خاصة وبيانات سلامة المواد MSDS',
    descriptionEn: 'Hazardous commodities complying with IMDG/IATA DGR requiring MSDS and certified escort',
    maxWeightKg: 25000,
    maxVolumeCbm: 70,
    requiresTemperatureControl: false,
    requiresHazmatClearance: true,
    specialHandlingInstructionsAr: 'تركيب لوحات تحذيرية برتقالية وفحص كاشف التسريب قبل الانطلاق',
    specialHandlingInstructionsEn: 'Affix orange hazard placards and conduct gas leak verification prior to dispatch',
    status: 'ACTIVE'
  },
  {
    id: 'st_002',
    code: 'PERISHABLE',
    nameAr: 'الشحنات المبردة والسريعة التلف',
    nameEn: 'Perishable & Cold Chain Cargo',
    descriptionAr: 'الأغذية الطازجة والمستحضرات الطبية ذات الصلاحية المحدودة',
    descriptionEn: 'Chilled foods, pharmaceuticals, and biological samples requiring continuous temperature monitoring',
    maxWeightKg: 22000,
    maxVolumeCbm: 65,
    requiresTemperatureControl: true,
    requiresHazmatClearance: false,
    specialHandlingInstructionsAr: 'تشغيل وحدة التبريد قبل شحن البضائع بـ 3 ساعات للحفاظ على بيئة التبريد',
    specialHandlingInstructionsEn: 'Pre-cool reefer container 3 hours prior to loading to maintain setpoint temperature',
    status: 'ACTIVE'
  }
];

const MOCK_VEHICLES: VehicleRecord[] = [
  {
    id: 'veh_001',
    vehicleCode: 'TRK-RUH-8801',
    type: 'TRUCK',
    vin: '1M8GDM9A2KP098123',
    licensePlate: 'أ ب ج 1234',
    engineNumber: 'ENG-VOLVO-FH16-891',
    makeBrand: 'Volvo Trucks',
    model: 'FH16 750 Heavy Duty',
    modelYear: 2024,
    fuelType: 'DIESEL',
    maxPayloadKg: 28000,
    maxVolumeCbm: 85,
    maintenanceStatus: 'ACTIVE',
    odometerKm: 45200,
    assignedDriverId: 'drv_001',
    assignedDriverName: 'Tariq Al-Ghamdi',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veh_002',
    vehicleCode: 'VAN-JED-3320',
    type: 'VAN',
    vin: 'W1V9076331N882019',
    licensePlate: 'ح ط ي 5678',
    engineNumber: 'ENG-MB-SPR-4412',
    makeBrand: 'Mercedes-Benz',
    model: 'Sprinter Cargo Elec',
    modelYear: 2025,
    fuelType: 'ELECTRIC',
    maxPayloadKg: 22000,
    maxVolumeCbm: 14,
    maintenanceStatus: 'ACTIVE',
    odometerKm: 12800,
    assignedDriverId: 'drv_002',
    assignedDriverName: 'Yasser Al-Qahtani',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_CONTAINERS: ContainerRecord[] = [
  {
    id: 'cnt_001',
    containerNumber: 'MSCU8819234',
    type: '40HC',
    tareWeightKg: 3800,
    maxPayloadKg: 28680,
    maxVolumeCbm: 76.2,
    ownerName: 'Mediterranean Shipping Company (MSC)',
    operatorName: 'AJA Logistics Maritime Fleet',
    isReeferUnit: false,
    lastInspectionDate: '2026-06-15',
    maintenanceHistoryCount: 4,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cnt_002',
    containerNumber: 'CMAU9918201',
    type: 'REEFER',
    tareWeightKg: 4600,
    maxPayloadKg: 27400,
    maxVolumeCbm: 67.5,
    ownerName: 'CMA CGM Line',
    operatorName: 'AJA Cold Transport Division',
    isReeferUnit: true,
    minTempCelsius: -25,
    maxTempCelsius: 15,
    lastInspectionDate: '2026-07-01',
    maintenanceHistoryCount: 6,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_EQUIPMENT: EquipmentRecord[] = [
  {
    id: 'eq_001',
    equipmentCode: 'EQ-FORK-RUH-01',
    category: 'FORKLIFT',
    nameAr: 'راعة شوكية كهربائية ذاتية التوجيه 5 طن',
    nameEn: 'Electric Automated Guided Forklift 5-Ton',
    serialNumber: 'SN-TOYOTA-AGV-9912',
    warehouseHubName: 'Riyadh Central Mega Distribution Hub',
    powerSource: 'ELECTRIC_BATTERY',
    operationalStatus: 'OPERATIONAL',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'eq_002',
    equipmentCode: 'EQ-ROBOT-JED-04',
    category: 'WAREHOUSE_ROBOT',
    nameAr: 'روبوت فرز طرود كهرومغناطيسي عالي السرعة',
    nameEn: 'High-Speed Autonomous Parcel Sorting Robot',
    serialNumber: 'SN-AMR-SORTER-2026-04',
    warehouseHubName: 'Jeddah Gateway Logistics Park',
    powerSource: 'ELECTRIC_BATTERY',
    operationalStatus: 'OPERATIONAL',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_DRIVERS: DriverResourceRecord[] = [
  {
    id: 'drv_001',
    driverCode: 'DRV-SA-1002',
    fullNameAr: 'طارق عبد الله الغامدي',
    fullNameEn: 'Tariq Abdullah Al-Ghamdi',
    nationalIdOrIqama: '1098234121',
    licenseType: 'HAZMAT_CERTIFIED',
    licenseNumber: 'SA-LIC-881920',
    licenseExpiryDate: '2028-11-20',
    medicalClearanceStatus: 'PASSED',
    workingHoursToday: 4.5,
    maxAllowedDutyHours: 9,
    availabilityStatus: 'ON_TRIP',
    assignedVehicleVin: '1M8GDM9A2KP098123',
    assignedVehiclePlate: 'أ ب ج 1234',
    safetyPerformanceScore: 98,
    certifications: ['IATA DGR Certified', 'AJA Heavy Escort License', 'First Aid Responder'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'drv_002',
    driverCode: 'DRV-SA-1005',
    fullNameAr: 'ياسر محمد القحطاني',
    fullNameEn: 'Yasser Mohammed Al-Qahtani',
    nationalIdOrIqama: '1088712399',
    licenseType: 'LIGHT_VEHICLE',
    licenseNumber: 'SA-LIC-554109',
    licenseExpiryDate: '2027-04-10',
    medicalClearanceStatus: 'PASSED',
    workingHoursToday: 2.0,
    maxAllowedDutyHours: 8,
    availabilityStatus: 'AVAILABLE',
    assignedVehicleVin: 'W1V9076331N882019',
    assignedVehiclePlate: 'ح ط ي 5678',
    safetyPerformanceScore: 95,
    certifications: ['Eco-Driving Master', 'Last Mile Dispatch Certification'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_ASSETS: AssetRecord[] = [
  {
    id: 'ast_001',
    assetTagNumber: 'AST-IT-RUH-901',
    nameAr: 'خادم حوسبة مركز البيانات الميداني',
    nameEn: 'Edge Data Center Rugged Server Array',
    assetClass: 'IT',
    category: 'Data Infrastructure',
    serialNumber: 'SN-DELL-EDGE-2026-X',
    purchaseValueSar: 125000,
    currentValueSar: 98000,
    depreciationMethod: 'STRAIGHT_LINE',
    locationId: 'loc_ruh_hub',
    locationName: 'Riyadh Logistics Command Center',
    assignedToUserOrDept: 'IT Operations Infrastructure',
    warrantyExpiryDate: '2029-01-01',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_DIGITAL_ASSETS: DigitalAssetRecord[] = [
  {
    id: 'da_001',
    titleAr: 'شهادة الاعتماد الفني لشاحنات نقل المواد الخطرة',
    titleEn: 'Hazmat Transport Safety & Compliance Certificate',
    fileName: 'Hazmat_Transport_Permit_2026.pdf',
    assetType: 'CERTIFICATE',
    fileSizeBytes: 2450000,
    fileUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    mimeType: 'application/pdf',
    associatedEntityDomain: 'VEHICLE',
    associatedEntityId: 'veh_001',
    uploadedBy: 'Compliance Department',
    tags: ['HAZMAT', 'PERMIT', 'SFDA', 'TRANSPORT'],
    createdAt: new Date().toISOString()
  }
];

const MOCK_UOMS: UomRecord[] = [
  { id: 'uom_1', code: 'KG', nameAr: 'كيلوجرام', nameEn: 'Kilogram', category: 'WEIGHT', isBaseUnit: true, conversionFactorToBase: 1, status: 'ACTIVE' },
  { id: 'uom_2', code: 'TON', nameAr: 'طن متري', nameEn: 'Metric Ton', category: 'WEIGHT', isBaseUnit: false, conversionFactorToBase: 1000, status: 'ACTIVE' },
  { id: 'uom_3', code: 'LB', nameAr: 'باوند', nameEn: 'Pound', category: 'WEIGHT', isBaseUnit: false, conversionFactorToBase: 0.453592, status: 'ACTIVE' },
  { id: 'uom_4', code: 'CBM', nameAr: 'متر مكعب', nameEn: 'Cubic Meter', category: 'VOLUME', isBaseUnit: true, conversionFactorToBase: 1, status: 'ACTIVE' },
  { id: 'uom_5', code: 'CFT', nameAr: 'قدم مكعب', nameEn: 'Cubic Feet', category: 'VOLUME', isBaseUnit: false, conversionFactorToBase: 0.0283168, status: 'ACTIVE' },
  { id: 'uom_6', code: 'PCS', nameAr: 'قطعة', nameEn: 'Pieces', category: 'QUANTITY', isBaseUnit: true, conversionFactorToBase: 1, status: 'ACTIVE' },
  { id: 'uom_7', code: 'BOX', nameAr: 'صندوق', nameEn: 'Box', category: 'QUANTITY', isBaseUnit: false, conversionFactorToBase: 12, status: 'ACTIVE' },
  { id: 'uom_8', code: 'PALLET', nameAr: 'منصة تخزين (طبلية)', nameEn: 'Standard Pallet', category: 'QUANTITY', isBaseUnit: false, conversionFactorToBase: 50, status: 'ACTIVE' }
];

const MOCK_COMMODITIES: CommodityRecord[] = [
  {
    id: 'com_001',
    hsCode: '8471.30.00',
    unNumber: 'UN3481',
    hazmatClass: 'LITHIUM_BATTERIES',
    titleAr: 'أجهزة حاسوب محمولة تحتوي على بطاريات ليثيوم',
    titleEn: 'Portable Automatic Data Processing Machines with Lithium Ion Batteries',
    categoryName: 'Computers & Electronics',
    importDutyRatePercent: 5.0,
    vatRatePercent: 15.0,
    isRestrictedImport: false,
    requiresSpecialPermit: true,
    specialPermitAgencyAr: 'هيئه الاتصالات وتقنية المعلومات (CST)',
    specialPermitAgencyEn: 'Communications, Space and Technology Commission (CST)',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'com_002',
    hsCode: '3004.90.00',
    hazmatClass: 'MEDICAL',
    titleAr: 'أدوية ومستحضرات صيدلانية للاستعمال البشري',
    titleEn: 'Medicaments for Therapeutic or Prophylactic Uses',
    categoryName: 'Pharmaceuticals & Health',
    importDutyRatePercent: 0.0,
    vatRatePercent: 0.0,
    isRestrictedImport: true,
    requiresSpecialPermit: true,
    specialPermitAgencyAr: 'الهيئة العامة للغذاء والدواء (SFDA)',
    specialPermitAgencyEn: 'Saudi Food and Drug Authority (SFDA)',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class ProductResourceMasterService {
  // Local state fallbacks
  private static products: ProductMaster[] = [...MOCK_PRODUCTS];
  private static services: ServiceItem[] = [...MOCK_SERVICES];
  private static packages: ServicePackage[] = [...MOCK_PACKAGES];
  private static shipmentTypes: ShipmentTypeDefinition[] = [...MOCK_SHIPMENT_TYPES];
  private static vehicles: VehicleRecord[] = [...MOCK_VEHICLES];
  private static containers: ContainerRecord[] = [...MOCK_CONTAINERS];
  private static equipment: EquipmentRecord[] = [...MOCK_EQUIPMENT];
  private static drivers: DriverResourceRecord[] = [...MOCK_DRIVERS];
  private static assets: AssetRecord[] = [...MOCK_ASSETS];
  private static digitalAssets: DigitalAssetRecord[] = [...MOCK_DIGITAL_ASSETS];
  private static uoms: UomRecord[] = [...MOCK_UOMS];
  private static commodities: CommodityRecord[] = [...MOCK_COMMODITIES];
  private static hydratedFromLocalStore = false;

  private static collection(collectionName: string) {
    return getAdminFirestore().collection(collectionName);
  }

  private static useLocalStore(): boolean {
    return (
      process.env.FORCE_LOCAL_DATA_FALLBACK === 'true' ||
      (process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true')
    );
  }

  private static hydrateLocalStore(): void {
    if (!this.useLocalStore() || this.hydratedFromLocalStore) return;

    const data = localDb.getRaw();
    data.product_resource_master ||= {};
    const store = data.product_resource_master;

    store.products ||= MOCK_PRODUCTS;
    store.services ||= MOCK_SERVICES;
    store.service_packages ||= MOCK_PACKAGES;
    store.shipment_types ||= MOCK_SHIPMENT_TYPES;
    store.vehicles ||= MOCK_VEHICLES;
    store.containers ||= MOCK_CONTAINERS;
    store.equipment ||= MOCK_EQUIPMENT;
    store.drivers ||= MOCK_DRIVERS;
    store.assets ||= MOCK_ASSETS;
    store.digital_assets ||= MOCK_DIGITAL_ASSETS;
    store.uoms ||= MOCK_UOMS;
    store.commodities ||= MOCK_COMMODITIES;

    this.products = store.products;
    this.services = store.services;
    this.packages = store.service_packages;
    this.shipmentTypes = store.shipment_types;
    this.vehicles = store.vehicles;
    this.containers = store.containers;
    this.equipment = store.equipment;
    this.drivers = store.drivers;
    this.assets = store.assets;
    this.digitalAssets = store.digital_assets;
    this.uoms = store.uoms;
    this.commodities = store.commodities;

    localDb.save();
    this.hydratedFromLocalStore = true;
  }

  private static persistLocalStore(): void {
    if (!this.useLocalStore()) return;

    const data = localDb.getRaw();
    data.product_resource_master = {
      products: this.products,
      services: this.services,
      service_packages: this.packages,
      shipment_types: this.shipmentTypes,
      vehicles: this.vehicles,
      containers: this.containers,
      equipment: this.equipment,
      drivers: this.drivers,
      assets: this.assets,
      digital_assets: this.digitalAssets,
      uoms: this.uoms,
      commodities: this.commodities,
    };
    localDb.save();
  }

  private static updateLocalItem<T extends { id: string; updatedAt?: string }>(
    items: T[],
    id: string,
    updates: Partial<T>
  ): T {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Resource item not found');
    }

    items[index] = {
      ...items[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    } as T;
    this.persistLocalStore();
    return items[index];
  }

  private static deleteLocalItem<T extends { id: string }>(items: T[], id: string): boolean {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    this.persistLocalStore();
    return true;
  }

  // ----------------------------------------------------------------------
  // Products API
  // ----------------------------------------------------------------------
  public static async getProducts(): Promise<ProductMaster[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_products').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductMaster));
        }
      } catch (e) {
        // Return fallback
      }
    }
    return [...this.products];
  }

  public static async createProduct(
    input: Omit<ProductMaster, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ProductMaster> {
    const id = `prod_${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: ProductMaster = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_products').doc(id).set(newProduct);
      } catch (e) {
        // Local push
      }
    }
    this.products.unshift(newProduct);
    this.persistLocalStore();

    await AuditService.logAudit({
      actorId: userId,
      action: 'CREATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'ProductMaster',
      entityId: id,
      description: `Registered new Product SKU ${newProduct.sku} (${newProduct.nameEn})`,
      newState: newProduct
    });

    await EventBusService.publish({
      name: 'MasterRecordCreated',
      aggregateId: id,
      aggregateType: 'ProductMaster',
      module: 'MDM',
      priority: 'NORMAL',
      payload: newProduct
    });

    return newProduct;
  }

  public static async updateProduct(id: string, updates: Partial<ProductMaster>, userId: string): Promise<ProductMaster> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_products').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.products, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'ProductMaster',
      entityId: id,
      description: `Updated Product SKU ${updated.sku}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteProduct(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_products').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.products, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'ProductMaster',
        entityId: id,
        description: `Deleted Product SKU ${id}`
      });
    }
    return deleted;
  }

  // ----------------------------------------------------------------------
  // Service Catalog & Packages API
  // ----------------------------------------------------------------------
  public static async getServices(): Promise<ServiceItem[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_services').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem));
        }
      } catch (e) {}
    }
    return [...this.services];
  }

  public static async createService(
    input: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ServiceItem> {
    const id = `srv_${Date.now()}`;
    const now = new Date().toISOString();
    const newSrv: ServiceItem = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_services').doc(id).set(newSrv);
      } catch (e) {}
    }
    this.services.unshift(newSrv);
    this.persistLocalStore();

    await AuditService.logAudit({
      actorId: userId,
      action: 'CREATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'ServiceItem',
      entityId: id,
      description: `Defined Service Catalog item ${newSrv.serviceCode} (${newSrv.nameEn})`,
      newState: newSrv
    });

    return newSrv;
  }

  public static async updateService(id: string, updates: Partial<ServiceItem>, userId: string): Promise<ServiceItem> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_services').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.services, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'ServiceItem',
      entityId: id,
      description: `Updated Service Catalog item ${updated.serviceCode}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteService(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_services').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.services, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'ServiceItem',
        entityId: id,
        description: `Deleted Service Catalog item ${id}`
      });
    }
    return deleted;
  }

  public static async getServicePackages(): Promise<ServicePackage[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_service_packages').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServicePackage));
        }
      } catch (e) {}
    }
    return [...this.packages];
  }

  public static async getShipmentTypes(): Promise<ShipmentTypeDefinition[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_shipment_types').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as ShipmentTypeDefinition));
        }
      } catch (e) {}
    }
    return [...this.shipmentTypes];
  }

  // ----------------------------------------------------------------------
  // Vehicles & Containers API
  // ----------------------------------------------------------------------
  public static async getVehicles(): Promise<VehicleRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_vehicles').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as VehicleRecord));
        }
      } catch (e) {}
    }
    return [...this.vehicles];
  }

  public static async createVehicle(
    input: Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<VehicleRecord> {
    const id = `veh_${Date.now()}`;
    const now = new Date().toISOString();
    const newVeh: VehicleRecord = { ...input, id, createdAt: now, updatedAt: now };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_vehicles').doc(id).set(newVeh);
      } catch (e) {}
    }
    this.vehicles.unshift(newVeh);
    this.persistLocalStore();

    await AuditService.logAudit({
      actorId: userId,
      action: 'CREATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'VehicleRecord',
      entityId: id,
      description: `Registered Fleet Vehicle ${newVeh.vehicleCode} (VIN: ${newVeh.vin})`,
      newState: newVeh
    });

    return newVeh;
  }

  public static async updateVehicle(id: string, updates: Partial<VehicleRecord>, userId: string): Promise<VehicleRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_vehicles').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.vehicles, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'VehicleRecord',
      entityId: id,
      description: `Updated Fleet Vehicle ${updated.vehicleCode}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteVehicle(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_vehicles').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.vehicles, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'VehicleRecord',
        entityId: id,
        description: `Deleted Fleet Vehicle ${id}`
      });
    }
    return deleted;
  }

  public static async getContainers(): Promise<ContainerRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_containers').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContainerRecord));
        }
      } catch (e) {}
    }
    return [...this.containers];
  }

  public static async createContainer(
    input: Omit<ContainerRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ContainerRecord> {
    const id = `cnt_${Date.now()}`;
    const now = new Date().toISOString();
    const newCnt: ContainerRecord = { ...input, id, createdAt: now, updatedAt: now };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_containers').doc(id).set(newCnt);
      } catch (e) {}
    }
    this.containers.unshift(newCnt);
    this.persistLocalStore();

    return newCnt;
  }

  public static async updateContainer(id: string, updates: Partial<ContainerRecord>, userId: string): Promise<ContainerRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_containers').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.containers, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'ContainerRecord',
      entityId: id,
      description: `Updated Container ${updated.containerNumber}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteContainer(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_containers').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.containers, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'ContainerRecord',
        entityId: id,
        description: `Deleted Container ${id}`
      });
    }
    return deleted;
  }

  // ----------------------------------------------------------------------
  // Drivers & Warehouse Equipment API
  // ----------------------------------------------------------------------
  public static async getDrivers(): Promise<DriverResourceRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_drivers').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DriverResourceRecord));
        }
      } catch (e) {}
    }
    return [...this.drivers];
  }

  public static async updateDriver(id: string, updates: Partial<DriverResourceRecord>, userId: string): Promise<DriverResourceRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_drivers').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.drivers, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'DriverResourceRecord',
      entityId: id,
      description: `Updated Driver Resource ${updated.driverCode}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteDriver(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_drivers').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.drivers, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'DriverResourceRecord',
        entityId: id,
        description: `Deleted Driver Resource ${id}`
      });
    }
    return deleted;
  }

  public static async getEquipment(): Promise<EquipmentRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_equipment').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as EquipmentRecord));
        }
      } catch (e) {}
    }
    return [...this.equipment];
  }

  public static async updateEquipment(id: string, updates: Partial<EquipmentRecord>, userId: string): Promise<EquipmentRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_equipment').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.equipment, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'EquipmentRecord',
      entityId: id,
      description: `Updated Warehouse Equipment ${updated.equipmentCode}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteEquipment(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_equipment').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.equipment, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'EquipmentRecord',
        entityId: id,
        description: `Deleted Warehouse Equipment ${id}`
      });
    }
    return deleted;
  }

  // ----------------------------------------------------------------------
  // Assets & Digital Assets API
  // ----------------------------------------------------------------------
  public static async getAssets(): Promise<AssetRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_assets').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as AssetRecord));
        }
      } catch (e) {}
    }
    return [...this.assets];
  }

  public static async updateAsset(id: string, updates: Partial<AssetRecord>, userId: string): Promise<AssetRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_assets').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.assets, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'AssetRecord',
      entityId: id,
      description: `Updated Enterprise Asset ${updated.assetTagNumber}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteAsset(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_assets').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.assets, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'AssetRecord',
        entityId: id,
        description: `Deleted Enterprise Asset ${id}`
      });
    }
    return deleted;
  }

  public static async getDigitalAssets(): Promise<DigitalAssetRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_digital_assets').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DigitalAssetRecord));
        }
      } catch (e) {}
    }
    return [...this.digitalAssets];
  }

  public static async updateDigitalAsset(id: string, updates: Partial<DigitalAssetRecord>, userId: string): Promise<DigitalAssetRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_digital_assets').doc(id).update(updates);
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.digitalAssets, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'DigitalAssetRecord',
      entityId: id,
      description: `Updated Digital Asset ${updated.fileName}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteDigitalAsset(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_digital_assets').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.digitalAssets, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'DigitalAssetRecord',
        entityId: id,
        description: `Deleted Digital Asset ${id}`
      });
    }
    return deleted;
  }

  // ----------------------------------------------------------------------
  // UOM & Commodity Master API
  // ----------------------------------------------------------------------
  public static async getUoms(): Promise<UomRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_uoms').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as UomRecord));
        }
      } catch (e) {}
    }
    return [...this.uoms];
  }

  public static async createUom(input: Omit<UomRecord, 'id'>, userId: string): Promise<UomRecord> {
    const id = `uom_${Date.now()}`;
    const newUom: UomRecord = {
      ...input,
      code: input.code.toUpperCase(),
      id
    };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_uoms').doc(id).set(newUom);
      } catch (e) {}
    }
    this.uoms.unshift(newUom);
    this.persistLocalStore();

    await AuditService.logAudit({
      actorId: userId,
      action: 'CREATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'UomRecord',
      entityId: id,
      description: `Created UOM ${newUom.code}`,
      newState: newUom
    });

    return newUom;
  }

  public static async updateUom(id: string, updates: Partial<UomRecord>, userId: string): Promise<UomRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_uoms').doc(id).update(updates);
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.uoms, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'UomRecord',
      entityId: id,
      description: `Updated UOM ${updated.code}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteUom(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_uoms').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.uoms, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'UomRecord',
        entityId: id,
        description: `Deleted UOM ${id}`
      });
    }
    return deleted;
  }

  public static async getCommodities(): Promise<CommodityRecord[]> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        const snap = await this.collection('mdm_commodities').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommodityRecord));
        }
      } catch (e) {}
    }
    return [...this.commodities];
  }

  public static async createCommodity(
    input: Omit<CommodityRecord, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<CommodityRecord> {
    const id = `com_${Date.now()}`;
    const now = new Date().toISOString();
    const newCommodity: CommodityRecord = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_commodities').doc(id).set(newCommodity);
      } catch (e) {}
    }
    this.commodities.unshift(newCommodity);
    this.persistLocalStore();

    await AuditService.logAudit({
      actorId: userId,
      action: 'CREATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'CommodityRecord',
      entityId: id,
      description: `Created Commodity ${newCommodity.hsCode}`,
      newState: newCommodity
    });

    return newCommodity;
  }

  public static async updateCommodity(
    id: string,
    updates: Partial<CommodityRecord>,
    userId: string
  ): Promise<CommodityRecord> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_commodities').doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
      } catch (e) {}
    }

    const updated = this.updateLocalItem(this.commodities, id, updates);
    await AuditService.logAudit({
      actorId: userId,
      action: 'UPDATE',
      severity: 'INFO',
      module: 'MDM',
      entityType: 'CommodityRecord',
      entityId: id,
      description: `Updated Commodity ${updated.hsCode}`,
      newState: updated
    });
    return updated;
  }

  public static async deleteCommodity(id: string, userId: string): Promise<boolean> {
    this.hydrateLocalStore();
    if (!this.useLocalStore()) {
      try {
        await this.collection('mdm_commodities').doc(id).delete();
      } catch (e) {}
    }

    const deleted = this.deleteLocalItem(this.commodities, id);
    if (deleted) {
      await AuditService.logAudit({
        actorId: userId,
        action: 'DELETE',
        severity: 'WARNING',
        module: 'MDM',
        entityType: 'CommodityRecord',
        entityId: id,
        description: `Deleted Commodity ${id}`
      });
    }
    return deleted;
  }

  /**
   * Automatic UOM Conversion Matrix Calculator
   */
  public static convertUomValue(
    value: number,
    fromCode: string,
    toCode: string
  ): { resultValue: number; formula: string } {
    this.hydrateLocalStore();
    const from = this.uoms.find(u => u.code.toUpperCase() === fromCode.toUpperCase());
    const to = this.uoms.find(u => u.code.toUpperCase() === toCode.toUpperCase());

    if (!from || !to) {
      return { resultValue: value, formula: 'Direct 1:1 Identity fallback' };
    }

    if (from.category !== to.category) {
      return { resultValue: value, formula: `Incompatible UOM Categories (${from.category} vs ${to.category})` };
    }

    // Convert from -> base -> to
    const baseValue = value * from.conversionFactorToBase;
    const resultValue = baseValue / to.conversionFactorToBase;

    const formula = `${value} ${from.code} * (${from.conversionFactorToBase} / ${to.conversionFactorToBase}) = ${resultValue.toFixed(4)} ${to.code}`;
    return { resultValue, formula };
  }
}
