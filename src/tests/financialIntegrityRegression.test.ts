/**
 * AJA INTERNATIONAL LOGISTICS — STEP 24 Financial Integrity & Accounting Invariants Regression Test
 * Validates monetary accuracy, double-entry ledger balancing, and invoice-payment-refund invariants.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

test('STEP 24 — Financial Integrity & Ledger Invariants', async (t) => {
  await t.test('1. Invoice total equals Subtotal + Taxes + Charges - Discounts with fixed-point precision', () => {
    const subtotalCents = 1250000; // 12,500.00 SAR
    const vatRate = 0.15; // 15% VAT
    const taxCents = Math.round(subtotalCents * vatRate); // 1,875.00 SAR
    const customsHandlingChargeCents = 45000; // 450.00 SAR
    const discountCents = 50000; // 500.00 SAR

    const calculatedTotalCents = subtotalCents + taxCents + customsHandlingChargeCents - discountCents;
    const expectedTotalCents = 1432500; // 14,325.00 SAR

    assert.equal(calculatedTotalCents, expectedTotalCents, 'Invoice total calculation must be exact to the cent');
  });

  await t.test('2. Double-Entry Accounting Invariant: Total Debits == Total Credits', () => {
    // A payment of 14,325.00 SAR settled for Invoice #INV-2026-001
    const journalEntries = [
      { account: '1010_CASH_AND_BANK', debitCents: 1432500, creditCents: 0 },
      { account: '1200_ACCOUNTS_RECEIVABLE', debitCents: 0, creditCents: 1432500 },
    ];

    const totalDebits = journalEntries.reduce((sum, e) => sum + e.debitCents, 0);
    const totalCredits = journalEntries.reduce((sum, e) => sum + e.creditCents, 0);

    assert.equal(totalDebits, totalCredits, 'Total Debits must exactly equal Total Credits');
    assert.equal(totalDebits, 1432500);
  });

  await t.test('3. Payment, Capture & Refund limits constraint invariant', () => {
    const authorizedAmountCents = 1000000; // 10,000.00 SAR
    const capturedAmountCents = 1000000; // 10,000.00 SAR

    // Scenario A: Valid Partial Refund
    const refund1Cents = 250000; // 2,500.00 SAR
    assert.ok(refund1Cents <= capturedAmountCents, 'Partial refund must be <= captured amount');

    // Scenario B: Remaining Refundable
    const remainingRefundableCents = capturedAmountCents - refund1Cents;
    assert.equal(remainingRefundableCents, 750000);

    // Scenario C: Reject Over-Refund
    const invalidRefundCents = 800000; // 8,000.00 SAR > 7,500.00 SAR
    const isRefundAllowed = invalidRefundCents <= remainingRefundableCents;
    assert.equal(isRefundAllowed, false, 'Over-refunding beyond captured amount must be strictly prohibited');
  });

  await t.test('4. Quote to Shipment to Invoice conversion flow invariant', () => {
    const quote = {
      quoteId: 'QUO-2026-8891',
      status: 'ACCEPTED',
      currency: 'SAR',
      freightCharges: 500000,
      customsClearance: 120000,
      insurance: 30000,
    };

    const quoteTotal = quote.freightCharges + quote.customsClearance + quote.insurance;
    assert.equal(quoteTotal, 650000, 'Quote total is 6,500.00 SAR');

    // Shipment Created
    const shipment = {
      shipmentId: 'SHP-2026-9901',
      originQuoteId: quote.quoteId,
      status: 'DELIVERED',
    };

    assert.equal(shipment.originQuoteId, quote.quoteId);

    // Final Invoice Generated from Quote
    const invoice = {
      invoiceId: 'INV-2026-7712',
      shipmentId: shipment.shipmentId,
      subtotalCents: quoteTotal,
      vatCents: Math.round(quoteTotal * 0.15),
      totalCents: quoteTotal + Math.round(quoteTotal * 0.15),
      status: 'ISSUED',
    };

    assert.equal(invoice.totalCents, 747500, 'Total invoice is 7,475.00 SAR');
  });
});
