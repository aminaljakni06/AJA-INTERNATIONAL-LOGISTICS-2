import { listUsers, createUser } from './repositories/userRepository';
import { createCompany, getCompanyById } from './repositories/companyRepository';
import { upsertCustomerProfile, getCustomerByUserId } from './repositories/customerRepository';
import { getAllServices, upsertService } from './repositories/serviceRepository';
import { getAllFAQs, upsertFAQ } from './repositories/faqRepository';
import { getShipmentById, createShipment } from './repositories/shipmentRepository';
import { addShipmentEvent, getEventsForShipment } from './repositories/shipmentEventRepository';
import { getQuoteById, createQuoteRequest } from './repositories/quoteRequestRepository';
import { createAuditLog, listAuditLogs } from './repositories/auditLogRepository';
import bcrypt from 'bcryptjs';

function requireSeedPassword(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be configured before seeding default Firebase users`);
  }
  return value;
}

export async function seedFirebaseDatabase(): Promise<{ status: string; seededCount: number }> {
  let seededCount = 0;
  const now = new Date().toISOString();

  try {
    // 1. Seed Users & Hashes
    const existingUsers = await listUsers();
    if (existingUsers.length === 0) {
      const adminHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_ADMIN_PASSWORD'), 10);
      const staffHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_STAFF_PASSWORD'), 10);
      const customerHash = bcrypt.hashSync(requireSeedPassword('DEFAULT_CUSTOMER_PASSWORD'), 10);

      await createUser({
        id: 'usr_admin_1',
        email: 'admin@aja-logistics.com',
        displayName: 'مدير النظام (Admin)',
        phone: '+966500000001',
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash: adminHash,
      });

      await createUser({
        id: 'usr_staff_1',
        email: 'staff@aja-logistics.com',
        displayName: 'مسؤول العمليات (Operations)',
        phone: '+966500000002',
        role: 'STAFF',
        status: 'ACTIVE',
        passwordHash: staffHash,
      });

      await createUser({
        id: 'usr_customer_1',
        email: 'customer@aja-logistics.com',
        displayName: 'شركة الأفق للاستيراد (Customer)',
        phone: '+966500000003',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        passwordHash: customerHash,
      });

      seededCount += 3;
    }
  } catch (err) {
    console.warn('[Seed Warning] Users seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 2. Seed Customer Profile
    const customerProfile = await getCustomerByUserId('usr_customer_1');
    if (!customerProfile) {
      await upsertCustomerProfile({
        userId: 'usr_customer_1',
        fullName: 'شركة الأفق للاستيراد والتصدير',
        companyName: 'شركة الأفق التجارية',
        phone: '+966500000003',
        email: 'customer@aja-logistics.com',
        address: 'الرياض - حي السلي',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
      });
      seededCount += 1;
    }
  } catch (err) {
    console.warn('[Seed Warning] Customer profile seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 3. Seed Companies
    const existingCompany = await getCompanyById('cmp_aja_1');
    if (!existingCompany) {
      await createCompany({
        id: 'cmp_aja_1',
        name: 'شركة أجا للخدمات اللوجستية',
        commercialRegister: '1010998877',
        taxNumber: '300998877600003',
        phone: '+966114000000',
        address: 'الرياض - حي الملز - طريق صلاح الدين الأيوبي',
      });
      seededCount += 1;
    }
  } catch (err) {
    console.warn('[Seed Warning] Company seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 4. Seed Services
    const services = await getAllServices();
    if (services.length === 0) {
      await upsertService({
        id: 'srv_sea_1',
        type: 'SEA_FREIGHT',
        titleAr: 'الشحن البحري الدولي',
        titleEn: 'International Sea Freight',
        descriptionAr: 'حلول الشحن البحري المتكاملة للكونتينرات الكلية FCL والجزئية LCL إلى كافة الموانئ العالمية.',
        descriptionEn: 'Comprehensive ocean freight solutions for FCL and LCL shipments to all worldwide ports.',
        iconName: 'Ship',
        featuresAr: ['حاويات كاملة FCL وحاويات جزئية LCL', 'تغطية للموانئ العالمية الرئيسية', 'تتبع حي لمسار السفينة', 'تخليص جمركي بالموانئ'],
        featuresEn: ['Full container FCL & Less container LCL', 'Global port coverage', 'Live vessel tracking', 'Port customs clearance'],
      });

      await upsertService({
        id: 'srv_land_1',
        type: 'LAND_FREIGHT',
        titleAr: 'الشحن البري المحلي والدولي',
        titleEn: 'Local & Overland Freight',
        descriptionAr: 'شحن بري سريع وآمن بأسطول شاحنات حديث مجهز لنقل البضائع والمعدات الثقيلة.',
        descriptionEn: 'Fast and reliable overland transport with modern truck fleet for commercial goods.',
        iconName: 'Truck',
        featuresAr: ['شاحنات مغلقة ومبردة', 'نقل البضائع الثقيلة والمشاريع', 'تغطية المملكة ودول الخليج', 'أنظمة تتبع بالجي بي إس GPS'],
        featuresEn: ['Refrigerated & closed trucks', 'Heavy machinery transport', 'Saudi & GCC coverage', 'GPS fleet tracking'],
      });

      await upsertService({
        id: 'srv_customs_1',
        type: 'CUSTOMS_CLEARANCE',
        titleAr: 'التخليص الجمركي',
        titleEn: 'Customs Clearance',
        descriptionAr: 'فريق متخصص لإنهاء المعاملات الجمركية بكفاءة عالية في المنافذ البحرية والبرية والجوية.',
        descriptionEn: 'Expert customs broker team handling sea, land, and air border clearances efficiently.',
        iconName: 'FileCheck',
        featuresAr: ['إعداد كافة الوثائق الجمركية', 'دعم منصات فسح وتفسيح', 'استشارات التصنيف الجمركي', 'تسريع الفحص والإفراج'],
        featuresEn: ['Document preparation', 'Fasah platform integration', 'Tariff classification consulting', 'Express clearance'],
      });

      seededCount += 3;
    }
  } catch (err) {
    console.warn('[Seed Warning] Services seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 5. Seed FAQs
    const faqs = await getAllFAQs();
    if (faqs.length === 0) {
      await upsertFAQ({
        id: 'faq_1',
        category: 'عام',
        questionAr: 'كيف يمكنني طلب عرض سعر لشحنة جديدة؟',
        questionEn: 'How can I request a quote for a new shipment?',
        answerAr: 'يمكنك طلب عرض سعر بسهولة عبر الضغط على زِر "طلب عرض سعر" في الموقع وتعبئة تفاصيل البضاعة والمصدر والوجهة.',
        answerEn: 'You can easily request a quote by clicking "Request Quote" on the home page and providing cargo details.',
      });
      await upsertFAQ({
        id: 'faq_2',
        category: 'التتبع',
        questionAr: 'كيف أستطيع تتبع حالة شحنتي؟',
        questionEn: 'How do I track my shipment status?',
        answerAr: 'أدخل رقم التتبع الخاص بك في شريط البحث في الصفحة الرئيسية أو سجل الدخول إلى بوابتك الخاصة لمشاهدة الجدول الزمني المباشر للشحنة.',
        answerEn: 'Enter your tracking number in the tracking search bar on the home page or log into your portal for real-time tracking.',
      });
      seededCount += 2;
    }
  } catch (err) {
    console.warn('[Seed Warning] FAQs seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 6. Seed Quotes
    const existingQuote = await getQuoteById('QR-2026-101');
    if (!existingQuote) {
      await createQuoteRequest({
        id: 'QR-2026-101',
        customerId: 'usr_customer_1',
        shipmentType: 'SEA_FREIGHT',
        pickupLocation: 'Ningbo Port, China',
        deliveryLocation: 'Jeddah Islamic Port, Saudi Arabia',
        cargoType: 'Electronic Appliances',
        approximateWeight: 24000,
        packageOrContainerCount: 2,
        expectedShippingDate: '2026-08-01',
        notes: '2x40ft High Cube Containers',
        status: 'UNDER_REVIEW',
        internalNotes: 'قيد مراجعة خطوط الشحن البحري لميناء جدة الإسلامي',
      });
      seededCount += 1;
    }
  } catch (err) {
    console.warn('[Seed Warning] Quotes seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 7. Seed Shipments & Events
    const existingShipment = await getShipmentById('SHP-882910');
    if (!existingShipment) {
      await createShipment({
        id: 'SHP-882910',
        trackingNumber: 'AJA-882910-KSA',
        customerId: 'usr_customer_1',
        quoteRequestId: 'QR-2026-101',
        shipmentType: 'SEA_FREIGHT',
        pickupLocation: 'Shanghai Port, China',
        deliveryLocation: 'Riyadh Dry Port, Saudi Arabia',
        shippingDate: '2026-07-15',
        estimatedArrivalDate: '2026-08-05',
        currentStatus: 'IN_TRANSIT',
        customerVisibleNotes: 'البضاعة على متن السفينة المتجهة إلى جدة',
        internalNotes: 'رقم الحاوية: MSCU-9281048',
      });

      const events = await getEventsForShipment('SHP-882910');
      if (events.length === 0) {
        await addShipmentEvent({
          shipmentId: 'SHP-882910',
          status: 'RECEIVED',
          location: 'Shanghai Warehouse, China',
          description: 'تم استلام البضائع في مستودع شانغهاي وتفتيش الحاويات',
          visibleToCustomer: true,
          createdBy: 'usr_staff_1',
        });
        await addShipmentEvent({
          shipmentId: 'SHP-882910',
          status: 'IN_TRANSIT',
          location: 'Red Sea / In Transit',
          description: 'السفينة متجهة حالياً إلى ميناء جدة الإسلامي',
          visibleToCustomer: true,
          createdBy: 'usr_staff_1',
        });
      }
      seededCount += 1;
    }
  } catch (err) {
    console.warn('[Seed Warning] Shipments seeding:', err instanceof Error ? err.message : err);
  }

  try {
    // 8. Seed Audit Log
    const logs = await listAuditLogs(5);
    if (logs.length === 0) {
      await createAuditLog({
        actorUserId: 'usr_admin_1',
        action: 'FIRESTORE_DATABASE_BOOTSTRAP',
        entityType: 'SYSTEM',
        entityId: 'sys_root',
        before: null,
        after: { initializedAt: now },
      });
      seededCount += 1;
    }
  } catch (err) {
    console.warn('[Seed Warning] Audit log seeding:', err instanceof Error ? err.message : err);
  }

  return { status: 'OK', seededCount };
}
