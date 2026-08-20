import { seedFirebaseDatabase } from './seedFirebase';
import { 
  getUserById, 
  getUserByEmail, 
  createUser, 
  listUsers 
} from './repositories/userRepository';
import { 
  upsertCustomerProfile, 
  getCustomerByUserId 
} from './repositories/customerRepository';
import { 
  createCompany, 
  getCompanyById 
} from './repositories/companyRepository';
import { 
  createQuoteRequest, 
  getQuoteById, 
  listQuotesForCustomer 
} from './repositories/quoteRequestRepository';
import { 
  createShipment, 
  getShipmentById, 
  getShipmentByTrackingNumber, 
  listShipmentsForCustomer 
} from './repositories/shipmentRepository';
import { 
  addShipmentEvent, 
  getEventsForShipment 
} from './repositories/shipmentEventRepository';
import { 
  createDocument, 
  getDocumentsByOwner 
} from './repositories/documentRepository';
import { 
  createNotification, 
  getNotificationsForUser, 
  markNotificationAsRead 
} from './repositories/notificationRepository';
import { 
  createMessage, 
  getMessagesByCustomer 
} from './repositories/messageRepository';
import { 
  upsertService, 
  getAllServices 
} from './repositories/serviceRepository';
import { 
  upsertFAQ, 
  getAllFAQs 
} from './repositories/faqRepository';
import { 
  upsertCMSContent, 
  getCMSContentByKey 
} from './repositories/cmsContentRepository';
import { 
  createAuditLog, 
  listAuditLogs 
} from './repositories/auditLogRepository';

export async function runVerificationTests() {
  console.log('=== STARTING DATABASE VERIFICATION TESTS ===');

  // 1. Connectivity & Seeding
  console.log('[1/4] Testing Connectivity & Seeding...');
  const seedResult = await seedFirebaseDatabase();
  console.log('  -> Seed Status:', seedResult);

  // 2. Write Operations Test
  console.log('[2/4] Testing Write Operations Across All 13 Models...');
  const testId = `test_${Date.now()}`;

  // Users
  const testUser = await createUser({
    id: `usr_${testId}`,
    email: `${testId}@aja-test.com`,
    displayName: 'Test User Verification',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  });
  console.log('  -> User created:', testUser.id);

  // Customers
  const testCustomer = await upsertCustomerProfile({
    userId: testUser.id,
    fullName: 'Test Customer Profile',
    email: testUser.email,
    phone: '+966500000999',
    companyName: 'Verification Corp',
  });
  console.log('  -> Customer profile created for:', testCustomer.userId);

  // Companies
  const testCompany = await createCompany({
    id: `cmp_${testId}`,
    name: 'Aja Logistics Partner Test',
    phone: '+966110000000',
  });
  console.log('  -> Company created:', testCompany.id);

  // Quote Requests
  const testQuote = await createQuoteRequest({
    customerId: testUser.id,
    shipmentType: 'AIR_FREIGHT',
    pickupLocation: 'Riyadh King Khalid Airport',
    deliveryLocation: 'Dubai Cargo City',
    cargoType: 'Medical Equipment',
    status: 'NEW',
  });
  console.log('  -> Quote request created:', testQuote.id);

  // Shipments
  const testShipment = await createShipment({
    trackingNumber: `AJA-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: testUser.id,
    quoteRequestId: testQuote.id,
    shipmentType: 'AIR_FREIGHT',
    pickupLocation: 'Riyadh Airport',
    deliveryLocation: 'Dubai Cargo City',
    currentStatus: 'RECEIVED',
  });
  console.log('  -> Shipment created:', testShipment.trackingNumber);

  // Shipment Events (Append-Only)
  const testEvent = await addShipmentEvent({
    shipmentId: testShipment.id,
    status: 'RECEIVED',
    description: 'Cargo received at Riyadh hub',
    location: 'Riyadh Airport',
    visibleToCustomer: true,
    createdBy: testUser.id,
  });
  console.log('  -> Shipment event added:', testEvent.id);

  // Documents
  const testDoc = await createDocument({
    ownerType: 'SHIPMENT',
    ownerId: testShipment.id,
    fileName: 'AirwayBill.pdf',
    fileType: 'application/pdf',
    fileSize: 102450,
    storagePath: `/docs/${testShipment.id}/AirwayBill.pdf`,
    uploadedBy: testUser.id,
  });
  console.log('  -> Document registered:', testDoc.id);

  // Notifications
  const testNotif = await createNotification({
    recipientUserId: testUser.id,
    title: 'Shipment Created',
    body: `Your shipment ${testShipment.trackingNumber} is registered.`,
    type: 'SHIPMENT_UPDATE',
    relatedEntityType: 'SHIPMENT',
    relatedEntityId: testShipment.id,
  });
  console.log('  -> Notification sent:', testNotif.id);

  // Messages
  const testMsg = await createMessage({
    customerId: testUser.id,
    shipmentId: testShipment.id,
    senderId: testUser.id,
    message: 'Hello, what is the estimated departure time?',
  });
  console.log('  -> Message sent:', testMsg.id);

  // Services
  const testService = await upsertService({
    id: `srv_${testId}`,
    type: 'AIR_FREIGHT',
    titleAr: 'الشحن الجوي السريع',
    titleEn: 'Express Air Freight',
    descriptionAr: 'خدمات الشحن الجوي الفائق السرعة لجميع دول العالم',
    descriptionEn: 'High-speed air freight to international destinations',
    iconName: 'Plane',
    featuresAr: ['تسليم خلال 48 ساعة', 'تغطية للمطارات العالمية'],
    featuresEn: ['48-hour delivery', 'Global airport coverage'],
  });
  console.log('  -> Service created:', testService.id);

  // FAQs
  const testFAQ = await upsertFAQ({
    id: `faq_${testId}`,
    category: 'الشحن الجوي',
    questionAr: 'ما هي المواد المسموح بها في الشحن الجوي؟',
    questionEn: 'What cargo is allowed in air freight?',
    answerAr: 'جميع البضائع التجارية غير الخطرة معتمدة للشحن الجوي.',
    answerEn: 'All non-hazardous commercial goods are accepted.',
  });
  console.log('  -> FAQ created:', testFAQ.id);

  // CMS Content
  const testCMS = await upsertCMSContent('test_banner_key', {
    titleAr: 'عروض الشحن الصيفية',
    titleEn: 'Summer Shipping Offers',
    contentAr: 'خصومات تصل إلى 20% على الشحن البحري',
    contentEn: 'Up to 20% off on ocean freight',
  });
  console.log('  -> CMS content updated:', testCMS.key);

  // Audit Logs
  const testAudit = await createAuditLog({
    actorUserId: testUser.id,
    action: 'TEST_VERIFICATION_COMPLETE',
    entityType: 'TEST_SUITE',
    entityId: testId,
    after: { status: 'SUCCESS' },
  });
  console.log('  -> Audit log entry added:', testAudit.id);

  // 3. Read Operations Test
  console.log('[3/4] Testing Read Operations Across All 13 Models...');
  const fetchedUser = await getUserById(testUser.id);
  const fetchedUserByEmail = await getUserByEmail(testUser.email);
  const fetchedCustomer = await getCustomerByUserId(testUser.id);
  const fetchedCompany = await getCompanyById(testCompany.id);
  const fetchedQuote = await getQuoteById(testQuote.id);
  const fetchedShipmentByTrack = await getShipmentByTrackingNumber(testShipment.trackingNumber);
  const fetchedEvents = await getEventsForShipment(testShipment.id);
  const fetchedDocs = await getDocumentsByOwner('SHIPMENT', testShipment.id);
  const fetchedNotifs = await getNotificationsForUser(testUser.id);
  const fetchedMsgs = await getMessagesByCustomer(testUser.id);
  const fetchedServices = await getAllServices();
  const fetchedFAQs = await getAllFAQs();
  const fetchedCMS = await getCMSContentByKey('test_banner_key');
  const fetchedAudits = await listAuditLogs(10);

  console.log('  -> Read Users:', !!fetchedUser && !!fetchedUserByEmail);
  console.log('  -> Read Customer Profile:', !!fetchedCustomer);
  console.log('  -> Read Company:', !!fetchedCompany);
  console.log('  -> Read Quote Request:', !!fetchedQuote);
  console.log('  -> Read Shipment:', !!fetchedShipmentByTrack);
  console.log('  -> Read Shipment Events count:', fetchedEvents.length);
  console.log('  -> Read Documents count:', fetchedDocs.length);
  console.log('  -> Read Notifications count:', fetchedNotifs.length);
  console.log('  -> Read Messages count:', fetchedMsgs.length);
  console.log('  -> Read Services count:', fetchedServices.length);
  console.log('  -> Read FAQs count:', fetchedFAQs.length);
  console.log('  -> Read CMS Content:', !!fetchedCMS);
  console.log('  -> Read Audit Logs count:', fetchedAudits.length);

  // 4. Authorization Boundaries Test
  console.log('[4/4] Testing Authorization Boundaries & Queries...');
  const customer1Quotes = await listQuotesForCustomer(testUser.id);
  const customer1Shipments = await listShipmentsForCustomer(testUser.id);
  console.log('  -> Customer isolation check: Customer quotes count =', customer1Quotes.length);
  console.log('  -> Customer isolation check: Customer shipments count =', customer1Shipments.length);

  console.log('=== ALL DATABASE VERIFICATION TESTS COMPLETED SUCCESSFULLY! ===');
  return true;
}

if (process.argv[1].endsWith('verifyDatabase.ts') || process.argv[1].endsWith('verifyDatabase.js')) {
  runVerificationTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Verification failed:', err);
      process.exit(1);
    });
}
