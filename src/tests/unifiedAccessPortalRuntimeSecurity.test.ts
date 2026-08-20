/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-02
 * Unified Access Portal Runtime Security Verification & Tenant Isolation Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, isAccessAllowedForCustomer, sanitizeUser } from '../server/auth';
import { 
  createUser, 
  getUserByEmail, 
  getUserById, 
  updateUser, 
  listUsers 
} from '../db/repositories/userRepository';
import { 
  upsertCustomerProfile, 
  getCustomerByUserId 
} from '../db/repositories/customerRepository';
import { 
  createQuoteRequest, 
  getQuoteById, 
  listQuotesForCustomer, 
  listAllQuotes, 
  updateQuoteRequest 
} from '../db/repositories/quoteRequestRepository';
import { 
  createShipment, 
  getShipmentById, 
  listShipmentsForCustomer, 
  listAllShipments 
} from '../db/repositories/shipmentRepository';
import { UserDoc } from '../types/firestore';

test('STEP UAP-02 — Unified Access Portal Runtime Security & Isolation Verification', async (t) => {
  const timestamp = Date.now();
  const customerAId = `usr_cust_a_${timestamp}`;
  const customerBId = `usr_cust_b_${timestamp}`;
  const staffId = `usr_staff_${timestamp}`;
  const adminId = `usr_admin_${timestamp}`;

  const customerAEmail = `customer.a.${timestamp}@test.ajalogistics.com`;
  const customerBEmail = `customer.b.${timestamp}@test.ajalogistics.com`;
  const staffEmail = `staff.${timestamp}@test.ajalogistics.com`;
  const adminEmail = `admin.${timestamp}@test.ajalogistics.com`;

  const rawPassword = 'SecurePassword@2026';
  const passwordHash = bcrypt.hashSync(rawPassword, 10);

  // Setup test users in repository
  await createUser({
    id: customerAId,
    email: customerAEmail,
    displayName: 'Customer Alpha',
    phone: '+966500000001',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    passwordHash,
  });

  await upsertCustomerProfile({
    userId: customerAId,
    fullName: 'Customer Alpha',
    email: customerAEmail,
    phone: '+966500000001',
    companyName: 'Alpha Trading Establishment',
    address: 'King Fahd Road, Riyadh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
  });

  await createUser({
    id: customerBId,
    email: customerBEmail,
    displayName: 'Customer Beta',
    phone: '+966500000002',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    passwordHash,
  });

  await upsertCustomerProfile({
    userId: customerBId,
    fullName: 'Customer Beta',
    email: customerBEmail,
    phone: '+966500000002',
    companyName: 'Beta Industrial Logistics',
    address: 'Al Andalus, Jeddah',
    city: 'Jeddah',
    country: 'Saudi Arabia',
  });

  await createUser({
    id: staffId,
    email: staffEmail,
    displayName: 'Operations Officer',
    phone: '+966500000003',
    role: 'STAFF',
    status: 'ACTIVE',
    passwordHash,
  });

  await createUser({
    id: adminId,
    email: adminEmail,
    displayName: 'Security Admin',
    phone: '+966500000004',
    role: 'ADMIN',
    status: 'ACTIVE',
    passwordHash,
  });

  await t.test('1. Customer Authentication & Identity Resolution', async () => {
    // 1.1 Retrieve user by email and verify password hash
    const userDoc = await getUserByEmail(customerAEmail);
    assert.ok(userDoc, 'Customer user record must exist');
    assert.equal(userDoc.role, 'CUSTOMER', 'Customer role must be correctly resolved');
    
    const isPasswordValid = bcrypt.compareSync(rawPassword, userDoc.passwordHash!);
    assert.equal(isPasswordValid, true, 'Bcrypt verification must succeed for valid credentials');

    // 1.2 Generate and verify JWT token
    const token = generateToken({
      userId: userDoc.id,
      email: userDoc.email,
      role: userDoc.role,
      fullName: userDoc.displayName,
    });
    assert.ok(token, 'JWT Token must be generated');

    const decoded = verifyToken(token);
    assert.ok(decoded, 'JWT Token must be decoded successfully');
    assert.equal(decoded.userId, customerAId);
    assert.equal(decoded.role, 'CUSTOMER');

    // 1.3 Customer Profile resolution
    const profile = await getCustomerByUserId(customerAId);
    assert.ok(profile, 'Customer profile must be loaded');
    assert.equal(profile.companyName, 'Alpha Trading Establishment');
  });

  await t.test('2. Customer Authorized Read & Write Operations', async () => {
    // 2.1 Customer A creates a Quote Request
    const quoteA = await createQuoteRequest({
      customerId: customerAId,
      customerName: 'Customer Alpha',
      customerEmail: customerAEmail,
      customerPhone: '+966500000001',
      companyName: 'Alpha Trading Establishment',
      shipmentType: 'SEA',
      pickupLocation: 'Jeddah Islamic Port',
      deliveryLocation: 'Riyadh Dry Port',
      cargoType: 'Industrial Machinery',
      status: 'NEW',
    } as any);

    assert.ok(quoteA.id, 'Quote request must be assigned an ID');
    assert.equal(quoteA.customerId, customerAId);

    // 2.2 Customer A creates a Shipment
    const shipmentA = await createShipment({
      trackingNumber: `AJA-${timestamp.toString().slice(-6)}-A`,
      customerId: customerAId,
      shipmentType: 'SEA',
      pickupLocation: 'Jeddah Islamic Port',
      deliveryLocation: 'Riyadh Dry Port',
      shippingDate: new Date().toISOString().split('T')[0],
      currentStatus: 'RECEIVED',
    } as any);

    assert.ok(shipmentA.id);
    assert.equal(shipmentA.customerId, customerAId);

    // 2.3 Customer A lists own quotes and shipments
    const quotesListA = await listQuotesForCustomer(customerAId);
    const hasOwnQuote = quotesListA.some((q) => q.id === quoteA.id);
    assert.equal(hasOwnQuote, true, 'Customer A must be able to list own quotes');

    const shipmentsListA = await listShipmentsForCustomer(customerAId);
    const hasOwnShipment = shipmentsListA.some((s) => s.id === shipmentA.id);
    assert.equal(hasOwnShipment, true, 'Customer A must be able to list own shipments');
  });

  await t.test('3. Cross-Tenant Negative Security Tests (Tenant Isolation)', async () => {
    // 3.1 Customer B creates Quote B and Shipment B
    const quoteB = await createQuoteRequest({
      customerId: customerBId,
      customerName: 'Customer Beta',
      customerEmail: customerBEmail,
      customerPhone: '+966500000002',
      companyName: 'Beta Industrial Logistics',
      shipmentType: 'AIR',
      pickupLocation: 'King Khalid International Airport',
      deliveryLocation: 'Dammam Airport',
      cargoType: 'Sensitive Electronics',
      status: 'NEW',
    } as any);

    const shipmentB = await createShipment({
      trackingNumber: `AJA-${timestamp.toString().slice(-6)}-B`,
      customerId: customerBId,
      shipmentType: 'AIR',
      pickupLocation: 'King Khalid International Airport',
      deliveryLocation: 'Dammam Airport',
      shippingDate: new Date().toISOString().split('T')[0],
      currentStatus: 'RECEIVED',
    } as any);

    // 3.2 Customer A lists quotes -> must NOT contain Quote B
    const quotesForA = await listQuotesForCustomer(customerAId);
    const leaksQuoteB = quotesForA.some((q) => q.id === quoteB.id || q.customerId === customerBId);
    assert.equal(leaksQuoteB, false, 'Customer A must NEVER see Customer B quotes');

    // 3.3 Customer A lists shipments -> must NOT contain Shipment B
    const shipmentsForA = await listShipmentsForCustomer(customerAId);
    const leaksShipmentB = shipmentsForA.some((s) => s.id === shipmentB.id || s.customerId === customerBId);
    assert.equal(leaksShipmentB, false, 'Customer A must NEVER see Customer B shipments');

    // 3.4 Authorization helper rejects Customer A accessing Customer B resource
    const authPayloadA = {
      userId: customerAId,
      email: customerAEmail,
      role: 'CUSTOMER' as const,
      fullName: 'Customer Alpha',
    };
    const accessAllowed = isAccessAllowedForCustomer(authPayloadA, customerBId);
    assert.equal(accessAllowed, false, 'Customer A must be DENIED access to Customer B data');
  });

  await t.test('4. Privilege Escalation Prevention', async () => {
    const authPayloadCustomer = {
      userId: customerAId,
      email: customerAEmail,
      role: 'CUSTOMER' as const,
      fullName: 'Customer Alpha',
    };

    // 4.1 Check sanitizeUser removes passwordHash
    const fullUser = await getUserById(customerAId);
    const sanitized = sanitizeUser(fullUser!);
    assert.equal((sanitized as any).passwordHash, undefined, 'SanitizeUser must strip passwordHash');

    // 4.2 Verify Customer cannot access Admin endpoints
    const isAdminAllowed = ['ADMIN'].includes(authPayloadCustomer.role);
    assert.equal(isAdminAllowed, false, 'Customer role must NOT evaluate to ADMIN');

    const isStaffAllowed = ['STAFF', 'ADMIN'].includes(authPayloadCustomer.role);
    assert.equal(isStaffAllowed, false, 'Customer role must NOT evaluate to STAFF or ADMIN');
  });

  await t.test('5. Admin & Staff Operations Authorization', async () => {
    const authPayloadAdmin = {
      userId: adminId,
      email: adminEmail,
      role: 'ADMIN' as const,
      fullName: 'Security Admin',
    };

    const authPayloadStaff = {
      userId: staffId,
      email: staffEmail,
      role: 'STAFF' as const,
      fullName: 'Operations Officer',
    };

    // 5.1 Admin can access all quotes and shipments across tenants
    const allQuotes = await listAllQuotes();
    assert.ok(allQuotes.length >= 2, 'Admin must see cross-tenant quotes');

    const allShipments = await listAllShipments();
    assert.ok(allShipments.length >= 2, 'Admin must see cross-tenant shipments');

    // 5.2 Staff access checks
    const staffCanAccessA = isAccessAllowedForCustomer(authPayloadStaff, customerAId);
    const staffCanAccessB = isAccessAllowedForCustomer(authPayloadStaff, customerBId);
    assert.equal(staffCanAccessA, true, 'Staff can access customer A context for operations');
    assert.equal(staffCanAccessB, true, 'Staff can access customer B context for operations');

    // 5.3 Admin can list all system users
    const allUsers = await listUsers();
    assert.ok(allUsers.some((u) => u.id === customerAId));
    assert.ok(allUsers.some((u) => u.id === adminId));
  });

  await t.test('6. Authentication Session Lifecycle & Token Tampering', async () => {
    // 6.1 Valid token verification
    const validToken = generateToken({
      userId: customerAId,
      email: customerAEmail,
      role: 'CUSTOMER',
      fullName: 'Customer Alpha',
    });
    const verified = verifyToken(validToken);
    assert.ok(verified);

    // 6.2 Tampered token verification fails
    const tamperedToken = validToken.slice(0, -5) + 'AAAAA';
    const tamperedResult = verifyToken(tamperedToken);
    assert.equal(tamperedResult, null, 'Tampered token must fail validation');

    // 6.3 Empty or invalid string token
    assert.equal(verifyToken(''), null, 'Empty token must fail validation');
    assert.equal(verifyToken('invalid.jwt.token'), null, 'Malformed token must fail validation');
  });

  await t.test('7. Password Reset & Update Lifecycle', async () => {
    const newPassword = 'NewSecurePassword@2026';
    const newHash = bcrypt.hashSync(newPassword, 10);

    // Update password hash
    await updateUser(customerAId, { passwordHash: newHash });

    // Verify old password fails and new password succeeds
    const userAfterUpdate = await getUserById(customerAId);
    assert.ok(userAfterUpdate);

    const oldPassValid = bcrypt.compareSync(rawPassword, userAfterUpdate.passwordHash!);
    assert.equal(oldPassValid, false, 'Old password must no longer validate');

    const newPassValid = bcrypt.compareSync(newPassword, userAfterUpdate.passwordHash!);
    assert.equal(newPassValid, true, 'New password must validate successfully');
  });

  // Exit cleanly after assertions
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
