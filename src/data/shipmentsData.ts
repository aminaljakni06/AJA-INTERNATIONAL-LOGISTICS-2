import { ServiceType } from '../types/quote';

/**
 * Standard 6 Core Shipment Statuses as requested:
 * 1. Shipment Created
 * 2. Picked Up
 * 3. In Transit
 * 4. At Customs
 * 5. Out for Delivery
 * 6. Delivered
 */
export type CoreShipmentStatus =
  | 'SHIPMENT_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_CUSTOMS'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface CoreStatusMeta {
  key: CoreShipmentStatus;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeVariant: 'created' | 'in-transit' | 'at-customs' | 'out-for-delivery' | 'delivered' | 'error';
  stepOrder: number;
}

export const CORE_STATUS_CONFIG: Record<CoreShipmentStatus, CoreStatusMeta> = {
  SHIPMENT_CREATED: {
    key: 'SHIPMENT_CREATED',
    labelAr: 'تم إنشاء الشحنة',
    labelEn: 'Shipment Created',
    descriptionAr: 'تم إصدار رقم التتبع وتأكيد الحجز وتجهيز البوليصة الرقمية.',
    descriptionEn: 'Tracking number generated, booking confirmed & waybill issued.',
    badgeVariant: 'created',
    stepOrder: 1,
  },
  PICKED_UP: {
    key: 'PICKED_UP',
    labelAr: 'تم الاستلام من المورد',
    labelEn: 'Picked Up',
    descriptionAr: 'تم استلام الشحنة من مستودع المصنع وتأمين الحاوية بالأقفال.',
    descriptionEn: 'Cargo collected from origin facility & security sealed.',
    badgeVariant: 'created',
    stepOrder: 2,
  },
  IN_TRANSIT: {
    key: 'IN_TRANSIT',
    labelAr: 'قيد الشحن والتنقل',
    labelEn: 'In Transit',
    descriptionAr: 'الشحنة قيد الإبحار / النقل البري الدولي المباشر باتجاه وجهة الوصول.',
    descriptionEn: 'Cargo in live international ocean/land transit toward destination.',
    badgeVariant: 'in-transit',
    stepOrder: 3,
  },
  AT_CUSTOMS: {
    key: 'AT_CUSTOMS',
    labelAr: 'في الفسح الجمركي',
    labelEn: 'At Customs',
    descriptionAr: 'وصول الشحنة لمنفذ الوصول وجاري الفحص الجمركي عبر نظام فسح.',
    descriptionEn: 'Arrived at destination port & under FASAH customs inspection.',
    badgeVariant: 'at-customs',
    stepOrder: 4,
  },
  OUT_FOR_DELIVERY: {
    key: 'OUT_FOR_DELIVERY',
    labelAr: 'خرج للتسليم النهائي',
    labelEn: 'Out for Delivery',
    descriptionAr: 'تحميل الشحنة على شاحنة الأسطول المحلي والتوجيه لعنوان المستلم.',
    descriptionEn: 'Dispatched on local fleet truck for final warehouse delivery.',
    badgeVariant: 'out-for-delivery',
    stepOrder: 5,
  },
  DELIVERED: {
    key: 'DELIVERED',
    labelAr: 'تم التسليم بنجاح',
    labelEn: 'Delivered',
    descriptionAr: 'تم تفريغ البضاعة بالموقع وتوقيع إثبات التوصيل الرقمي (e-POD).',
    descriptionEn: 'Cargo offloaded pristine; digital POD signed by recipient.',
    badgeVariant: 'delivered',
    stepOrder: 6,
  },
};

export interface TimelineStep {
  status: CoreShipmentStatus;
  titleAr: string;
  titleEn: string;
  date: string;
  location: string;
  descriptionAr: string;
  descriptionEn: string;
  completed: boolean;
  current: boolean;
  order: number;
}

export interface ShipmentEventItem {
  id: string;
  timestamp: string;
  status: CoreShipmentStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  location: string;
  descriptionAr: string;
  descriptionEn: string;
  operatorOrFacility?: string;
}

export interface DetailedShipment {
  id: string;
  trackingNumber: string;
  currentStatus: CoreShipmentStatus;
  statusAr: string;
  statusEn: string;
  shipmentType: ServiceType;
  shipmentTypeAr: string;
  shipmentTypeEn: string;
  origin: string;
  originPort?: string;
  destination: string;
  destinationPort?: string;
  currentLocation: string;
  estimatedDelivery: string;
  pickupDate: string;
  cargoDescriptionAr: string;
  cargoDescriptionEn: string;
  weightKg: number;
  volumeCbm?: number;
  containerCount?: number;
  containerNumber?: string;
  vesselOrFleetName?: string;
  carrierName?: string;
  driverName?: string;
  driverPhone?: string;
  senderName: string;
  receiverName: string;
  customerName: string;
  progressPercent: number;
  timeline: TimelineStep[];
  events: ShipmentEventItem[];
  // Backward compatibility alias for legacy components
  milestones?: any[];
  documents?: { nameAr: string; nameEn: string; url: string; type: string }[];
}

export const MOCK_SHIPMENTS_DATABASE: Record<string, DetailedShipment> = {
  'AJA-2026-000001': {
    id: 'SHP-2026-001',
    trackingNumber: 'AJA-2026-000001',
    currentStatus: 'IN_TRANSIT',
    statusAr: 'قيد الشحن والتنقل الدولي',
    statusEn: 'In Ocean Transit',
    shipmentType: 'SEA_FREIGHT',
    shipmentTypeAr: 'الشحن البحري الدولي (Sea Freight)',
    shipmentTypeEn: 'Ocean Freight Services',
    origin: 'ميناء نينغبو (Ningbo Port), الصين',
    originPort: 'CNNGB - Ningbo Zhoushan',
    destination: 'ميناء جدة الإسلامي (Jeddah Islamic Port), السعودية',
    destinationPort: 'SAJED - Jeddah Islamic Port',
    currentLocation: 'مضيق باب المندب (Bab-el-Mandeb Strait)',
    estimatedDelivery: '2026-07-28',
    pickupDate: '2026-07-15',
    cargoDescriptionAr: 'معدات طاقة وشاشات إلكترونية عالية الدقة',
    cargoDescriptionEn: 'Power Distribution Equipment & Precision Displays',
    weightKg: 18500,
    volumeCbm: 68,
    containerCount: 2,
    containerNumber: 'TGHU-984102-4 / MSKU-772910-1',
    vesselOrFleetName: 'AJA PACIFIC EXPRESS V.204',
    carrierName: 'AJA Global Shipping Line',
    driverName: 'الكابتن / أحمد الفارس (الربان المسؤول)',
    driverPhone: '+966 50 112 2334',
    senderName: 'Shenzhen Technology Power Corp',
    receiverName: 'شركة التقنية الوطنية للتجارة - الرياض',
    customerName: 'شركة التقنية الوطنية',
    progressPercent: 60,
    timeline: [
      {
        status: 'SHIPMENT_CREATED',
        titleAr: 'تم إنشاء الشحنة وتأكيد الحجز',
        titleEn: 'Shipment Created & Booked',
        date: '2026-07-12 09:30 AM',
        location: 'مركز عمليات أجا - الرياض',
        descriptionAr: 'تم إصدار بوليصة الشحن الدولية وتخصيص رقم التتبع الفوري.',
        descriptionEn: 'International BOL generated & tracking assigned.',
        completed: true,
        current: false,
        order: 1,
      },
      {
        status: 'PICKED_UP',
        titleAr: 'تم الاستلام من المورد',
        titleEn: 'Cargo Picked Up',
        date: '2026-07-15 02:15 PM',
        location: 'مستودع المصنع - نينغبو، الصين',
        descriptionAr: 'تم استلام الحاويات وإغلاق الأقفال الأمنية المعتمدة.',
        descriptionEn: 'Containers collected & security seals verified.',
        completed: true,
        current: false,
        order: 2,
      },
      {
        status: 'IN_TRANSIT',
        titleAr: 'قيد الشحن والتنقل الدولي',
        titleEn: 'In Live Transit',
        date: '2026-07-19 04:45 PM',
        location: 'مضيق باب المندب - البحر الأحمر',
        descriptionAr: 'السفينة تبحر باتجاه ميناء جدة الإسلامي بمتوسط سرعة 18 عقدة.',
        descriptionEn: 'Sailing smoothly through Red Sea route towards Jeddah.',
        completed: false,
        current: true,
        order: 3,
      },
      {
        status: 'AT_CUSTOMS',
        titleAr: 'في الفسح الجمركي',
        titleEn: 'At Customs',
        date: 'متوقع 2026-07-27',
        location: 'ميناء جدة الإسلامي - ساحة المعاينة',
        descriptionAr: 'تجهيز البيان الجمركي آلياً عبر منصة فسح سريعة.',
        descriptionEn: 'Digital clearance setup on Saudi FASAH portal.',
        completed: false,
        current: false,
        order: 4,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        titleAr: 'خرج للتسليم النهائي',
        titleEn: 'Out for Delivery',
        date: 'متوقع 2026-07-28',
        location: 'طريق جدة - الرياض السريع',
        descriptionAr: 'تحميل الشاحنات المجهزة بنظام GPS للتوجه للمستودع النهائي.',
        descriptionEn: 'Dispatched via heavy GPS-tracked trucks.',
        completed: false,
        current: false,
        order: 5,
      },
      {
        status: 'DELIVERED',
        titleAr: 'تم التسليم بنجاح',
        titleEn: 'Delivered',
        date: 'متوقع 2026-07-28 03:00 PM',
        location: 'مستودعات الرياض المركزية',
        descriptionAr: 'التفريغ النهائي وتسليم إثبات التوصيل الرقمي (e-POD).',
        descriptionEn: 'Offloading & e-POD signature verification.',
        completed: false,
        current: false,
        order: 6,
      },
    ],
    events: [
      {
        id: 'EVT-101',
        timestamp: '2026-07-24 08:00 AM',
        status: 'IN_TRANSIT',
        statusLabelAr: 'تحديث المسار الفضائي (GPS)',
        statusLabelEn: 'GPS Location Ping',
        location: 'مضيق باب المندب - خط عرض 12.58° N',
        descriptionAr: 'إشارة الأقمار الصناعية تؤكد عبور الممر المائي دون معوقات وبسرعة 18.2 عقدة.',
        descriptionEn: 'Vessel satellite feed confirms smooth sailing at 18.2 knots.',
        operatorOrFacility: 'AJA Maritime Telematics System',
      },
      {
        id: 'EVT-102',
        timestamp: '2026-07-21 11:30 AM',
        status: 'IN_TRANSIT',
        statusLabelAr: 'مغادرة ميناء الترانزيت',
        statusLabelEn: 'Port Departure',
        location: 'ميناء سنغافورة المحوري',
        descriptionAr: 'إكمال التزود بالوقود وإعادة التوجيه إلى مسار البحر الأحمر.',
        descriptionEn: 'Refueling completed; vessel departed Singapore hub.',
        operatorOrFacility: 'PSA Singapore Terminal Hub',
      },
      {
        id: 'EVT-103',
        timestamp: '2026-07-19 04:45 PM',
        status: 'IN_TRANSIT',
        statusLabelAr: 'تحميل السفينة والإبحار',
        statusLabelEn: 'Vessel Departure',
        location: 'ميناء نينغبو - الرصيف 4',
        descriptionAr: 'تم رفع الحاوية TGHU-984102-4 إلى متن السفينة وانطلاق الرحلة.',
        descriptionEn: 'Container loaded onto AJA Pacific Express; departed berth.',
        operatorOrFacility: 'Ningbo Zhoushan Port Authority',
      },
      {
        id: 'EVT-104',
        timestamp: '2026-07-15 02:15 PM',
        status: 'PICKED_UP',
        statusLabelAr: 'استلام البضائع بالصين',
        statusLabelEn: 'Origin Cargo Collection',
        descriptionAr: 'استلام الطبالي وتدقيق الوزن الفعلي وإغلاق الحاوية بالأقفال المعتمدة.',
        location: 'مستودع المصنع - نينغبو',
        descriptionEn: 'Cargo weight verified & containers sealed.',
        operatorOrFacility: 'AJA China Operations Hub',
      },
      {
        id: 'EVT-105',
        timestamp: '2026-07-12 09:30 AM',
        status: 'SHIPMENT_CREATED',
        statusLabelAr: 'إنشاء ملف الشحنة',
        statusLabelEn: 'Shipment File Initialized',
        location: 'المركز الرئيسي - الرياض',
        descriptionAr: 'تم حجز المساحة وتوليد الرقم المرجعي AJA-2026-000001.',
        descriptionEn: 'Space booked and international waybill created.',
        operatorOrFacility: 'AJA Core ERP Gateway',
      },
    ],
    documents: [
      { nameAr: 'بوليصة الشحن البحرية (Bill of Lading)', nameEn: 'Master Bill of Lading (MBL)', url: '#', type: 'PDF' },
      { nameAr: 'البيان الجمركي المبدئي (FASAH)', nameEn: 'Customs Declaration', url: '#', type: 'PDF' },
      { nameAr: 'شهادة المنشأ والمواصفات', nameEn: 'Certificate of Origin', url: '#', type: 'PDF' },
    ],
  },
  'AJA-889021': {
    id: 'SHP-2026-088',
    trackingNumber: 'AJA-889021',
    currentStatus: 'AT_CUSTOMS',
    statusAr: 'في الفسح الجمركي (منصة فسح)',
    statusEn: 'Customs Inspection (FASAH)',
    shipmentType: 'CUSTOMS_CLEARANCE',
    shipmentTypeAr: 'الفسح وإدارة الحاويات (Customs Clearance)',
    shipmentTypeEn: 'Customs & Demurrage Management',
    origin: 'ميناء جبل علي (Jebel Ali Port), دبي',
    originPort: 'AEJEA - Jebel Ali Port',
    destination: 'ميناء الملك عبد العزيز (Dammam Port), الخبر',
    destinationPort: 'SADMM - King Abdulaziz Port Dammam',
    currentLocation: 'ساحة المعاينة الجمركية - ميناء الدمام',
    estimatedDelivery: '2026-07-26',
    pickupDate: '2026-07-18',
    cargoDescriptionAr: 'قطع غيار سيارات ومحركات صناعية يابانية',
    cargoDescriptionEn: 'Automotive Spare Parts & Industrial Motors',
    weightKg: 12400,
    volumeCbm: 42,
    containerCount: 1,
    containerNumber: 'HLCU-801294-0',
    vesselOrFleetName: 'ARABIAN FLEET TRUCK #408',
    carrierName: 'AJA Express Overland & Customs',
    driverName: 'سلمان العتيبي (سائق الأسطول)',
    driverPhone: '+966 55 443 8899',
    senderName: 'Gulf Auto Trade FZE',
    receiverName: 'مؤسسة الملحم للمحركات - الدمام',
    customerName: 'مؤسسة الملحم للمحركات',
    progressPercent: 70,
    timeline: [
      {
        status: 'SHIPMENT_CREATED',
        titleAr: 'تم إنشاء الشحنة وتجهيز المانفيست',
        titleEn: 'Shipment Created & Manifest Ready',
        date: '2026-07-17 08:00 AM',
        location: 'مكتب الدمام اللوجستي',
        descriptionAr: 'إنشاء الملف التفصيلي وتجهيز التفاويض الجمركية الرقمية.',
        descriptionEn: 'Customs clearance record initialized on system.',
        completed: true,
        current: false,
        order: 1,
      },
      {
        status: 'PICKED_UP',
        titleAr: 'تم الاستلام من جبل علي',
        titleEn: 'Cargo Picked Up',
        date: '2026-07-18 10:30 AM',
        location: 'منطقة جبل علي الحرة - دبي',
        descriptionAr: 'استلام الحاوية وفحص الفواتير التجارية وشعارات المنشأ.',
        descriptionEn: 'Container collected with commercial invoices.',
        completed: true,
        current: false,
        order: 2,
      },
      {
        status: 'IN_TRANSIT',
        titleAr: 'قيد الشحن والنقل البري',
        titleEn: 'In Overland Transit',
        date: '2026-07-20 02:00 PM',
        location: 'منفذ البطحاء الحدودي',
        descriptionAr: 'عبور الشاحنة عبر المسار السريع وتدقيق أرقام الأقفال.',
        descriptionEn: 'Crossed border checkpoint under transit bond.',
        completed: true,
        current: false,
        order: 3,
      },
      {
        status: 'AT_CUSTOMS',
        titleAr: 'في الفسح الجمركي',
        titleEn: 'Under Customs Inspection',
        date: '2026-07-24 10:00 AM',
        location: 'ميناء الملك عبد العزيز بالدمام',
        descriptionAr: 'جاري تسوية الفاتورة الجمركية الموحدة وطباعة فسح الخروج عبر فسح.',
        descriptionEn: 'Unified duty invoice processing on FASAH platform.',
        completed: false,
        current: true,
        order: 4,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        titleAr: 'خرج للتسليم النهائي',
        titleEn: 'Out for Delivery',
        date: 'متوقع 2026-07-26',
        location: 'طريق الدمام - الخبر السريع',
        descriptionAr: 'تحميل الشاحنة والانطلاق للعنوان النهائي للمستلم.',
        descriptionEn: 'Smart truck assigned for final dispatch.',
        completed: false,
        current: false,
        order: 5,
      },
      {
        status: 'DELIVERED',
        titleAr: 'تم التسليم بنجاح',
        titleEn: 'Delivered',
        date: 'متوقع 2026-07-26 02:00 PM',
        location: 'مستودعات الخبر - المدينة الصناعية',
        descriptionAr: 'التسليم والتوقيع على نموذج e-POD النهائي.',
        descriptionEn: 'Handover complete; e-POD signature pending.',
        completed: false,
        current: false,
        order: 6,
      },
    ],
    events: [
      {
        id: 'EVT-201',
        timestamp: '2026-07-24 10:00 AM',
        status: 'AT_CUSTOMS',
        statusLabelAr: 'سداد الرسوم والجمرك',
        statusLabelEn: 'Duty Payment Settlement',
        location: 'جمرك ميناء الملك عبد العزيز بالدمام',
        descriptionAr: 'تم مطابقة مستند سداد الرسوم وهيئة الزكاة والضريبة والجمارك (ZATCA).',
        descriptionEn: 'Customs & VAT duty settlement confirmed.',
        operatorOrFacility: 'Saudi FASAH Portal & ZATCA',
      },
      {
        id: 'EVT-202',
        timestamp: '2026-07-22 09:15 AM',
        status: 'AT_CUSTOMS',
        statusLabelAr: 'الفحص بالأشعة السينية',
        statusLabelEn: 'X-Ray Scanner Pass',
        location: 'ساحة المعاينة الأولى - الدمام',
        descriptionAr: 'تمرير الحاوية HLCU-801294-0 عبر جهاز الفحص الذكي ونسبة المطابقة 100%.',
        descriptionEn: 'X-Ray scanning cleared with zero discrepancies.',
        operatorOrFacility: 'Port Customs Inspection Bay #2',
      },
      {
        id: 'EVT-203',
        timestamp: '2026-07-20 02:00 PM',
        status: 'IN_TRANSIT',
        statusLabelAr: 'عبور الجمرك الحدودي',
        statusLabelEn: 'Border Clearance',
        location: 'منفذ البطحاء البري',
        descriptionAr: 'تدقيق البيان العابر وإتاحة خروج الشاحنة نحو ميناء الدمام.',
        descriptionEn: 'Inbound transit bond cleared at border.',
        operatorOrFacility: 'Al Batha Border Post Authority',
      },
      {
        id: 'EVT-204',
        timestamp: '2026-07-18 10:30 AM',
        status: 'PICKED_UP',
        statusLabelAr: 'تحميل الشاحنة',
        statusLabelEn: 'Overland Fleet Loading',
        location: 'جبل علي - دبي',
        descriptionAr: 'استلام الحاوية المفتوحة وربط جهاز التتبع بنظام أجا.',
        descriptionEn: 'Cargo hooked up to smart overland GPS unit.',
        operatorOrFacility: 'AJA UAE Transport Terminal',
      },
      {
        id: 'EVT-205',
        timestamp: '2026-07-17 08:00 AM',
        status: 'SHIPMENT_CREATED',
        statusLabelAr: 'إنشاء طلب الفسح',
        statusLabelEn: 'Clearance Record Created',
        location: 'مكتب الدمام',
        descriptionAr: 'تسجيل التفتيش وإرسال التفاويض لمخلص أجا المعتمد.',
        descriptionEn: 'Clearance case created & broker assigned.',
        operatorOrFacility: 'AJA Customs Operations',
      },
    ],
    documents: [
      { nameAr: 'البيان الجمركي المعتمد (FASAH Certificate)', nameEn: 'FASAH Customs Certificate', url: '#', type: 'PDF' },
      { nameAr: 'إيصال سداد الرسوم الجمركية (ZATCA Receipt)', nameEn: 'Duty Payment Receipt', url: '#', type: 'PDF' },
    ],
  },
  'AJA-104928': {
    id: 'SHP-2026-104',
    trackingNumber: 'AJA-104928',
    currentStatus: 'DELIVERED',
    statusAr: 'تم التسليم بنجاح وتوقيع e-POD',
    statusEn: 'Delivered & e-POD Signed',
    shipmentType: 'LAND_FREIGHT',
    shipmentTypeAr: 'النقل البري المبرد والأسطول الذكي',
    shipmentTypeEn: 'Reefer Land Freight & Smart Fleet',
    origin: 'الرياض - المنطقة الصناعية الثانية',
    destination: 'جدة - مستودعات الخمرة اللوجستية',
    currentLocation: 'تم التسليم بالكامل - مستودع الخمرة جدة',
    estimatedDelivery: '2026-07-23',
    pickupDate: '2026-07-21',
    cargoDescriptionAr: 'منتجات بلاستيكية ومواد تغليف غذائية مبردة',
    cargoDescriptionEn: 'Food-Grade Plastics & Cold-Chain Packaging',
    weightKg: 24000,
    volumeCbm: 85,
    containerCount: 1,
    containerNumber: 'TRK-AJA-901',
    vesselOrFleetName: 'AJA REEFER TRUCK #901',
    carrierName: 'AJA Express Heavy Land Fleet',
    driverName: 'محمد الشهري',
    driverPhone: '+966 50 998 7766',
    senderName: 'مصنع الشرقية للبلاستيك',
    receiverName: 'أسواق التغذية الكبرى - جدة',
    customerName: 'مصنع الشرقية للبلاستيك',
    progressPercent: 100,
    timeline: [
      {
        status: 'SHIPMENT_CREATED',
        titleAr: 'تم إنشاء الشحنة وتعيين السائق',
        titleEn: 'Shipment Created & Driver Assigned',
        date: '2026-07-20 04:00 PM',
        location: 'مركز عمليات الرياض',
        descriptionAr: 'تخصيص شاحنة مبردة ذات تتبع حراري مباشر وتجهيز خط السير.',
        descriptionEn: 'Reefer truck reserved with telemetry tracking.',
        completed: true,
        current: false,
        order: 1,
      },
      {
        status: 'PICKED_UP',
        titleAr: 'تم الاستلام من المصنع',
        titleEn: 'Cargo Picked Up',
        date: '2026-07-21 07:30 AM',
        location: 'الصناعية الثانية بالرياض',
        descriptionAr: 'شحن 26 طبلية وضبط التكييف على درجة +4 مئوية.',
        descriptionEn: 'Loaded 26 pallets; temperature set at +4°C.',
        completed: true,
        current: false,
        order: 2,
      },
      {
        status: 'IN_TRANSIT',
        titleAr: 'قيد الشحن والتنقل البري',
        titleEn: 'In Highway Transit',
        date: '2026-07-22 02:00 PM',
        location: 'طريق الرياض - جدة السريع (طريق 40)',
        descriptionAr: 'الشاحنة تسير بسرعة منتظمة مع ثبات حرارة البراد طول المسار.',
        descriptionEn: 'Highway transit completed with continuous temperature logs.',
        completed: true,
        current: false,
        order: 3,
      },
      {
        status: 'AT_CUSTOMS',
        titleAr: 'العبور والمراجعة الأمنية',
        titleEn: 'Security & Weight Audit',
        date: '2026-07-23 06:00 AM',
        location: 'مدخل مدينة جدة اللوجستي',
        descriptionAr: 'مطابقة التصريح البري والعبور دون أي ملاحظات.',
        descriptionEn: 'Highway transport permit scanned & verified.',
        completed: true,
        current: false,
        order: 4,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        titleAr: 'خرج للتسليم النهائي',
        titleEn: 'Out for Final Delivery',
        date: '2026-07-23 09:00 AM',
        location: 'منطقة الخمرة اللوجستية - جدة',
        descriptionAr: 'الاصطفاف في رصيف التفريغ رقم 3 وتجهيز العمالة.',
        descriptionEn: 'Docked at Bay #3 for unloading.',
        completed: true,
        current: false,
        order: 5,
      },
      {
        status: 'DELIVERED',
        titleAr: 'تم التسليم بنجاح',
        titleEn: 'Delivered',
        date: '2026-07-23 11:15 AM',
        location: 'جدة - مستودعات الخمرة',
        descriptionAr: 'استلام كافة الطبالي بحالة ممتازة وتوقيع إثبات التوصيل الرقمي (e-POD).',
        descriptionEn: 'All cargo offloaded pristine; digital POD signed.',
        completed: true,
        current: true,
        order: 6,
      },
    ],
    events: [
      {
        id: 'EVT-301',
        timestamp: '2026-07-23 11:15 AM',
        status: 'DELIVERED',
        statusLabelAr: 'توقيع إثبات التوصيل الرقمي',
        statusLabelEn: 'Digital POD Signed',
        location: 'مستودع المستلم - الخمرة، جدة',
        descriptionAr: 'قام مسئول المستودع بالتحقق وتوقيع المستند الإلكتروني عبر الجهاز الكفي.',
        descriptionEn: 'Warehouse supervisor signed handheld e-POD.',
        operatorOrFacility: 'AJA Driver App Terminal',
      },
      {
        id: 'EVT-302',
        timestamp: '2026-07-23 09:00 AM',
        status: 'OUT_FOR_DELIVERY',
        statusLabelAr: 'الوصول لرصيف التفريغ',
        statusLabelEn: 'Bay Docking',
        location: 'الخمرة - رصيف التفريغ 3',
        descriptionAr: 'تأكيد سلامة الأقفال الحرارية وتفريغ الطبالي.',
        descriptionEn: 'Thermal seal intake verified; offloading started.',
        operatorOrFacility: 'AJA Jeddah Logistics Hub',
      },
      {
        id: 'EVT-303',
        timestamp: '2026-07-22 02:00 PM',
        status: 'IN_TRANSIT',
        statusLabelAr: 'قراءة أجهزة التبريد (Telemetry)',
        statusLabelEn: 'Reefer Telemetry Check',
        location: 'طريق الرياض - الطائف السريع',
        descriptionAr: 'الحرارة الثابتة +4.1°C طوال المسار السريع.',
        descriptionEn: 'Temperature stable at +4.1°C along highway.',
        operatorOrFacility: 'AJA Smart Fleet Telematics',
      },
      {
        id: 'EVT-304',
        timestamp: '2026-07-21 07:30 AM',
        status: 'PICKED_UP',
        statusLabelAr: 'استلام وتأمين الشحنة',
        statusLabelEn: 'Factory Loading',
        location: 'الصناعية الثانية بالرياض',
        descriptionAr: 'تحميل 26 طبلية وإغلاق الباب بالمستشعر الذكي.',
        descriptionEn: 'Loaded 26 pallets into temperature-controlled reefer.',
        operatorOrFacility: 'AJA Trucking Central Depot',
      },
      {
        id: 'EVT-305',
        timestamp: '2026-07-20 04:00 PM',
        status: 'SHIPMENT_CREATED',
        statusLabelAr: 'تأكيد الحجز البري',
        statusLabelEn: 'Land Dispatch Created',
        location: 'مكتب العمليات - الرياض',
        descriptionAr: 'تأكيد حجز الشاحنة رقم TRK-AJA-901 وتكليف السائق.',
        descriptionEn: 'Land shipment ticket issued & driver assigned.',
        operatorOrFacility: 'AJA Land Freight Operations',
      },
    ],
    documents: [
      { nameAr: 'إثبات التوصيل الرقمي (e-POD)', nameEn: 'Electronic Proof of Delivery (e-POD)', url: '#', type: 'PDF' },
      { nameAr: 'تقرير درجة الحرارة والتبريد', nameEn: 'Temperature Log Report', url: '#', type: 'PDF' },
    ],
  },
};

/**
 * Dynamic shipment fallback generator for any custom tracking code entered by the user
 */
export function generateDynamicShipment(trackingNum: string): DetailedShipment {
  const clean = trackingNum.trim().toUpperCase();
  const today = new Date().toISOString().split('T')[0];

  return {
    id: `SHP-GEN-${Date.now().toString().slice(-5)}`,
    trackingNumber: clean,
    currentStatus: 'IN_TRANSIT',
    statusAr: 'قيد الشحن والتنقل الدولي المباشر',
    statusEn: 'Shipment in Live International Transit',
    shipmentType: 'SEA_FREIGHT',
    shipmentTypeAr: 'الشحن التجاري الدولي (Freight Express)',
    shipmentTypeEn: 'International Freight Express',
    origin: 'ميناء شنغهاي (Shanghai Port), الصين',
    originPort: 'CNSHA - Shanghai Port',
    destination: 'ميناء جدة الإسلامي (Jeddah Port), السعودية',
    destinationPort: 'SAJED - Jeddah Port',
    currentLocation: 'البحر الأحمر - متجهة إلى ميناء جدة',
    estimatedDelivery: '2026-07-29',
    pickupDate: today,
    cargoDescriptionAr: 'بضائع تجارية عامة ومعدات الكترونية',
    cargoDescriptionEn: 'General Commercial Goods & Electronics',
    weightKg: 15200,
    volumeCbm: 54,
    containerCount: 1,
    containerNumber: `AJA-CN-${clean.slice(-6)}`,
    vesselOrFleetName: 'AJA VOYAGER EXPRESS V.12',
    carrierName: 'AJA Global Freight Network',
    driverName: 'فريق العمليات اللوجستية',
    driverPhone: '+966 9200 00000',
    senderName: 'Global Exporters Ltd',
    receiverName: 'شركة الأعمال اللوجستية المتقدمة',
    customerName: 'العميل المعتمد',
    progressPercent: 55,
    timeline: [
      {
        status: 'SHIPMENT_CREATED',
        titleAr: 'تم إنشاء الشحنة وتأكيد الحجز',
        titleEn: 'Shipment Created',
        date: `${today} 08:00 AM`,
        location: 'المكتب الرئيسي - أجا',
        descriptionAr: 'تم إصدار بوليصة الشحن وتوليد كود التتبع المعياري.',
        descriptionEn: 'Booking processed and waybill generated.',
        completed: true,
        current: false,
        order: 1,
      },
      {
        status: 'PICKED_UP',
        titleAr: 'تم الاستلام من المورد',
        titleEn: 'Picked Up',
        date: `${today} 11:30 AM`,
        location: 'مستودعات الشحن الدولية',
        descriptionAr: 'استلام البضائع وفحص السلامة الفنية وتدقيق الأوزان.',
        descriptionEn: 'Cargo received and security checked.',
        completed: true,
        current: false,
        order: 2,
      },
      {
        status: 'IN_TRANSIT',
        titleAr: 'قيد الشحن والتنقل',
        titleEn: 'In Transit',
        date: 'اليوم',
        location: 'المسار المباشر نحو وجهة الوصول',
        descriptionAr: 'الشحنة تتحرك وفق الجدول الزمني المعتمد لرحلات أجا.',
        descriptionEn: 'Moving steadily along designated international route.',
        completed: false,
        current: true,
        order: 3,
      },
      {
        status: 'AT_CUSTOMS',
        titleAr: 'في الفسح الجمركي',
        titleEn: 'At Customs',
        date: 'قريباً',
        location: 'منفذ الوصول الجمركي',
        descriptionAr: 'سيتم معالجة البيان الجمركي آلياً فور الوصول.',
        descriptionEn: 'Customs release workflow standby.',
        completed: false,
        current: false,
        order: 4,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        titleAr: 'خرج للتسليم النهائي',
        titleEn: 'Out for Delivery',
        date: 'قريباً',
        location: 'أسطول التوزيع المحلي',
        descriptionAr: 'تحميل الشاحنات وتوجه السائق نحو العنوان المعتمد.',
        descriptionEn: 'Dispatched to local courier driver.',
        completed: false,
        current: false,
        order: 5,
      },
      {
        status: 'DELIVERED',
        titleAr: 'تم التسليم بنجاح',
        titleEn: 'Delivered',
        date: 'قريباً',
        location: 'العنوان النهائي للمستلم',
        descriptionAr: 'تسليم البضاعة وتوقيع بوليصة الاستلام الإلكترونية.',
        descriptionEn: 'Delivered with e-POD signed.',
        completed: false,
        current: false,
        order: 6,
      },
    ],
    events: [
      {
        id: `EVT-DYN-1`,
        timestamp: `${today} 02:00 PM`,
        status: 'IN_TRANSIT',
        statusLabelAr: 'تحديث الموقع الجغرافي الحي',
        statusLabelEn: 'Live Location Update',
        location: 'المسار البحري الدولي',
        descriptionAr: `الشحنة رقم (${clean}) قيد الحركة المباشرة وفي طريقها للتسليم.`,
        descriptionEn: `Shipment #${clean} actively moving along transit corridor.`,
        operatorOrFacility: 'AJA Automated Tracking Router',
      },
      {
        id: `EVT-DYN-2`,
        timestamp: `${today} 11:30 AM`,
        status: 'PICKED_UP',
        statusLabelAr: 'تأكيد الاستلام بالمحطة',
        statusLabelEn: 'Hub Receipt Verified',
        location: 'مركز تجميع الشحنات',
        descriptionAr: 'تم مسح الباركود الإلكتروني ومطابقة بيانات الشحنة.',
        descriptionEn: 'Barcode scanned and weight verified.',
        operatorOrFacility: 'Origin Freight Hub',
      },
      {
        id: `EVT-DYN-3`,
        timestamp: `${today} 08:00 AM`,
        status: 'SHIPMENT_CREATED',
        statusLabelAr: 'إنشاء الشحنة بالنظام',
        statusLabelEn: 'System Record Created',
        location: 'نظام إدارة الشحنات - أجا',
        descriptionAr: 'توليد السجل الإلكتروني وبدء تتبع الرحلة.',
        descriptionEn: 'Electronic tracking record initiated.',
        operatorOrFacility: 'AJA Logistics Platform Engine',
      },
    ],
  };
}
