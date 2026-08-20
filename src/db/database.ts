import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema } from './schema';
import { User } from '../types/user';
import { ServiceInfo, FAQItem } from '../types/cms';
import { QuoteRequest } from '../types/quote';
import { Shipment } from '../types/shipment';
import { AuditLog } from '../types/audit';

const DB_FILE = process.env.LOCAL_DB_FILE
  ? path.resolve(process.env.LOCAL_DB_FILE)
  : path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = path.dirname(DB_FILE);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed data
function requireSeedPassword(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured before seeding default users`);
  }
  return value;
}

function getInitialSeedData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_ADMIN_PASSWORD'), 10);
  const staffPasswordHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_STAFF_PASSWORD'), 10);
  const customerPasswordHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_CUSTOMER_PASSWORD'), 10);

  const now = new Date().toISOString();

  const defaultUsers: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin_1',
      email: 'admin@aja-logistics.com',
      passwordHash: adminPasswordHash,
      fullName: 'مدير النظام (Admin)',
      phone: '+966500000001',
      role: 'ADMIN',
      companyId: 'cmp_aja_1',
      companyName: 'شركة أجا للخدمات اللوجستية',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_staff_1',
      email: 'staff@aja-logistics.com',
      passwordHash: staffPasswordHash,
      fullName: 'مسؤول العمليات (Operations)',
      phone: '+966500000002',
      role: 'STAFF',
      companyId: 'cmp_aja_1',
      companyName: 'شركة أجا للخدمات اللوجستية',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr_customer_1',
      email: 'customer@aja-logistics.com',
      passwordHash: customerPasswordHash,
      fullName: 'شركة الأفق للاستيراد (Customer)',
      phone: '+966500000003',
      role: 'CUSTOMER',
      companyId: 'cmp_horizon_1',
      companyName: 'شركة الأفق للاستيراد والتصدير',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const defaultServices: ServiceInfo[] = [
    {
      id: 'srv_sea_1',
      type: 'SEA_FREIGHT',
      titleAr: 'الشحن البحري الدولي',
      titleEn: 'International Sea Freight',
      descriptionAr: 'حلول الشحن البحري المتكاملة للكونتينرات الكلية FCL والجزئية LCL إلى كافة الموانئ العالمية.',
      descriptionEn: 'Comprehensive ocean freight solutions for FCL and LCL shipments to all worldwide ports.',
      iconName: 'Ship',
      featuresAr: ['حاويات كاملة FCL وحاويات جزئية LCL', 'تغطية للموانئ العالمية الرئيسية', 'تتبع حي لمسار السفينة', 'تخليص جمركي بالموانئ'],
      featuresEn: ['Full container FCL & Less container LCL', 'Global port coverage', 'Live vessel tracking', 'Port customs clearance'],
    },
    {
      id: 'srv_land_1',
      type: 'LAND_FREIGHT',
      titleAr: 'الشحن البري المحلي والدولي',
      titleEn: 'Local & Overland Freight',
      descriptionAr: 'شحن بري سريع وآمن بأسطول شاحنات حديث مجهز لنقل البضائع والمعدات الثقيلة.',
      descriptionEn: 'Fast and reliable overland transport with modern truck fleet for commercial goods.',
      iconName: 'Truck',
      featuresAr: ['شاحنات مغلقة ومبردة', 'نقل البضائع الثقيلة والمشاريع', 'تغطية المملكة ودول الخليج', 'أنظمة تتبع بالجي بي إس GPS'],
      featuresEn: ['Refrigerated & closed trucks', 'Heavy machinery transport', 'Saudi & GCC coverage', 'GPS fleet tracking'],
    },
    {
      id: 'srv_customs_1',
      type: 'CUSTOMS_CLEARANCE',
      titleAr: 'التخليص الجمركي',
      titleEn: 'Customs Clearance',
      descriptionAr: 'فريق متخصص لإنهاء المعاملات الجمركية بكفاءة عالية في المنافذ البحرية والبرية والجوية.',
      descriptionEn: 'Expert customs broker team handling sea, land, and air border clearances efficiently.',
      iconName: 'FileCheck',
      featuresAr: ['إعداد كافة الوثائق الجمركية', 'دعم منصات فسح وتفسيح', 'استشارات التصنيف الجمركي', 'تسريع الفحص والإفراج'],
      featuresEn: ['Document preparation', 'Fasah platform integration', 'Tariff classification consulting', 'Express clearance'],
    },
    {
      id: 'srv_warehouse_1',
      type: 'WAREHOUSING',
      titleAr: 'التخزين والخدمات اللوجستية',
      titleEn: 'Warehousing & Logistics',
      descriptionAr: 'مستودعات مؤمنة ومكيفة لإدارة المخزون والتغليف والتوزيع بكل احترافية.',
      descriptionEn: 'Secure, climate-controlled warehousing for inventory management, packing, and distribution.',
      iconName: 'Warehouse',
      featuresAr: ['مستودعات معتمدة ومكيفة', 'إدارة المخزون الإلكترونية', 'خدمات التعبئة والتغليف', 'توزيع محلي وسريع'],
      featuresEn: ['Climate-controlled facilities', 'WMS inventory system', 'Packing & labeling', 'Last-mile distribution'],
    },
    {
      id: 'srv_door_1',
      type: 'DOOR_TO_DOOR',
      titleAr: 'خدمة من الباب إلى الباب',
      titleEn: 'Door to Door Services',
      descriptionAr: 'إدارة جميع مراحل الشحنة من مقر المورد حتى استلام البضاعة في مستودعكم مباشرة.',
      descriptionEn: 'End-to-end logistics handling shipment pickup from supplier right to your doorstep.',
      iconName: 'PackageCheck',
      featuresAr: ['استلام مباشر من المصنع', 'تنسيق متكامل للشحن والتخليص', 'تأمين شامل على الشحنات', 'مسؤول حساب خاص لكل شحنة'],
      featuresEn: ['Direct factory pickup', 'Integrated clearance & transport', 'Full insurance options', 'Dedicated account manager'],
    },
  ];

  const defaultFaqs: FAQItem[] = [
    {
      id: 'faq_1',
      category: 'عام',
      questionAr: 'كيف يمكنني طلب عرض سعر لشحنة جديدة؟',
      questionEn: 'How can I request a quote for a new shipment?',
      answerAr: 'يمكنك طلب عرض سعر بسهولة عبر الضغط على زِر "طلب عرض سعر" في الموقع وتعبئة تفاصيل البضاعة والمصدر والوجهة، وسيقوم فريقنا بالرد عليك خلال ساعات قليلة.',
      answerEn: 'You can easily request a quote by clicking "Request Quote" on the home page and providing cargo details. Our team will contact you shortly.',
    },
    {
      id: 'faq_2',
      category: 'التتبع',
      questionAr: 'كيف أستطيع تتبع حالة شحنتي؟',
      questionEn: 'How do I track my shipment status?',
      answerAr: 'أدخل رقم التتبع الخاص بك في شريط البحث في الصفحة الرئيسية أو سجل الدخول إلى بوابتك الخاصة لمشاهدة الجدول الزمني المباشر للشحنة.',
      answerEn: 'Enter your tracking number in the tracking search bar on the home page or log into your portal for real-time tracking.',
    },
    {
      id: 'faq_3',
      category: 'التخليص الجمركي',
      questionAr: 'ما هي المستندات المطلوبة للتخليص الجمركي؟',
      questionEn: 'What documents are required for customs clearance?',
      answerAr: 'تشمل الوثائق الرئيسية: الفاتورة التجارية، شهادة المنشأ، بوليصة الشحن (B/L)، وقائمة التعبئة، بالإضافة إلى التفويض الجمركي الإلكتروني عبر منصة فسح.',
      answerEn: 'Key documents include Commercial Invoice, Certificate of Origin, Bill of Lading, Packing List, and electronic authorization via Fasah.',
    },
  ];

  const defaultQuotes: QuoteRequest[] = [
    {
      id: 'QR-2026-101',
      customerId: 'usr_customer_1',
      customerName: 'شركة الأفق للاستيراد',
      customerEmail: 'customer@aja-logistics.com',
      customerPhone: '+966500000003',
      companyName: 'شركة الأفق للاستيراد والتصدير',
      serviceType: 'SEA_FREIGHT',
      origin: 'Ningbo Port, China',
      destination: 'Jeddah Islamic Port, Saudi Arabia',
      cargoDetails: '2x40ft High Cube Containers - Electronic Appliances',
      weightKg: 24000,
      volumeCbm: 135,
      status: 'UNDER_REVIEW',
      offeredPrice: null,
      adminNotes: 'قيد مراجعة خطوط الشحن البحري لميناء جدة الإسلامي',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const defaultShipments: Shipment[] = [
    {
      id: 'SHP-882910',
      trackingNumber: 'AJA-882910-KSA',
      customerId: 'usr_customer_1',
      customerName: 'شركة الأفق للاستيراد',
      customerPhone: '+966500000003',
      quoteRequestId: 'QR-2026-101',
      serviceType: 'SEA_FREIGHT',
      origin: 'Shanghai Port, China',
      destination: 'Riyadh Dry Port, Saudi Arabia',
      senderName: 'Shanghai Electronics Manufacturing Co.',
      receiverName: 'مستودعات الأفق - الرياض',
      status: 'IN_TRANSIT',
      currentLocation: 'البحر الأحمر - متجهة لميناء جدة الإسلامي',
      estimatedDelivery: '2026-08-05',
      weightKg: 18500,
      containerNumber: 'MSCU-9281048',
      events: [
        {
          id: 'evt_1',
          shipmentId: 'SHP-882910',
          status: 'RECEIVED',
          location: 'Shanghai Warehouse, China',
          descriptionAr: 'تم استلام البضائع في مستودع شانغهاي وتفتيش الحاويات',
          descriptionEn: 'Cargo received at Shanghai warehouse and inspected',
          timestamp: '2026-07-15T10:00:00Z',
        },
        {
          id: 'evt_2',
          shipmentId: 'SHP-882910',
          status: 'BOOKING_CONFIRMED',
          location: 'Shanghai Port',
          descriptionAr: 'تم تأكيد حجز السفينة وإيقاف الحاوية بالميناء',
          descriptionEn: 'Vessel booking confirmed at port',
          timestamp: '2026-07-17T14:30:00Z',
        },
        {
          id: 'evt_3',
          shipmentId: 'SHP-882910',
          status: 'LOADING',
          location: 'Shanghai Container Terminal',
          descriptionAr: 'تم تحميل الحاوية MSCU-9281048 على السفينة',
          descriptionEn: 'Container loaded onto cargo vessel',
          timestamp: '2026-07-19T08:15:00Z',
        },
        {
          id: 'evt_4',
          shipmentId: 'SHP-882910',
          status: 'IN_TRANSIT',
          location: 'Red Sea / In Transit',
          descriptionAr: 'السفينة متجهة حالياً إلى ميناء جدة الإسلامي',
          descriptionEn: 'Vessel currently in transit to Jeddah Islamic Port',
          timestamp: '2026-07-21T18:00:00Z',
        },
      ],
      createdAt: '2026-07-14T12:00:00Z',
      updatedAt: now,
    },
  ];

  const defaultAuditLogs: AuditLog[] = [
    {
      id: 'aud_1',
      actorId: 'usr_admin_1',
      actorEmail: 'admin@aja-logistics.com',
      actorRole: 'ADMIN',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'SYSTEM',
      entityId: 'sys_root',
      details: { note: 'Initial database bootstrap and schema creation.' },
      timestamp: now,
    },
  ];

  return {
    users: defaultUsers,
    companies: [
      {
        id: 'cmp_aja_1',
        name: 'شركة أجا للخدمات اللوجستية',
        commercialRegister: '1010998877',
        taxNumber: '300998877600003',
        phone: '+442079460000',
        address: 'لندن - حي الكناري وورف - شارع كندا 1 (المملكة المتحدة)',
        createdAt: now,
      },
      {
        id: 'cmp_horizon_1',
        name: 'شركة الأفق للاستيراد والتصدير',
        commercialRegister: '1010123456',
        taxNumber: '310123456700003',
        phone: '+966112223333',
        address: 'الرياض - حي السلي',
        createdAt: now,
      },
    ],
    customers: [
      {
        userId: 'usr_customer_1',
        fullName: 'شركة الأفق للاستيراد والتصدير',
        companyName: 'شركة الأفق للاستيراد والتصدير',
        phone: '+966500000003',
        email: 'customer@aja-logistics.com',
        address: 'الرياض - حي السلي',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        createdAt: now,
        updatedAt: now,
      },
    ],
    quote_requests: defaultQuotes,
    shipments: defaultShipments,
    shipment_events: [],
    services: defaultServices,
    faqs: defaultFaqs,
    notifications: [],
    messages: [],
    audit_logs: defaultAuditLogs,
    cms_content: [],
    location_master: {},
    product_resource_master: {},
    customer_360: {},
    identity_profiles: [],
    user_sessions: [],
    registered_devices: [],
    mfa_configs: [],
    identity_policies: {},
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseSchema;
        return parsed;
      }
    } catch (err) {
      console.error('Error reading db.json, creating initial seed:', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  public save(): void {
    this.saveData(this.data);
  }

  // Audit Logging Helper
  public logAudit(actor: { id: string; email: string; role: string }, action: string, entityType: string, entityId: string, details?: Record<string, unknown>, ipAddress?: string): void {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      details: details || null,
      ipAddress: ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
  }
}

export const db = new Database();
