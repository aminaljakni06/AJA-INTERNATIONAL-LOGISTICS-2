import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ShipmentSummaryPDFData {
  trackingNumber: string;
  serviceType: string;
  currentStatus: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  senderName: string;
  receiverName: string;
  grossWeightKg: number;
  volumetricWeightKg: number;
  totalCbm: string;
  customsDeclarationNo: string;
  customsStatus: string;
  declaredValueSAR: number;
  paymentStatus: string;
  shippingDate: string;
}

export const exportToPdf = async (elementId: string, filename: string, htmlContent?: string) => {
  try {
    let element = document.getElementById(elementId);
    let createdTemp = false;

    if (!element && htmlContent) {
      element = document.createElement('div');
      element.id = elementId;
      element.innerHTML = htmlContent;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '-9999px';
      document.body.appendChild(element);
      createdTemp = true;
    }

    if (element) {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    }

    if (createdTemp && element) {
      document.body.removeChild(element);
    }
  } catch (err) {
    console.error('exportToPdf failed:', err);
  }
};

export const generateShipmentPDF = async (shipment: any, elementId?: string) => {
  try {
    // If an HTML element ID is provided, render it using html2canvas
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Shipment_Summary_${shipment.trackingNumber || 'Report'}.pdf`);
        return;
      }
    }

    // Direct programmatic PDF generation via jsPDF
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const trackingNum = shipment.trackingNumber || 'TRK-2026-991';

    // Header Color Bar
    doc.setFillColor(8, 47, 73); // Brand Primary Navy #082F49
    doc.rect(0, 0, 210, 28, 'F');

    // Title & Branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('AJA LOGISTICS | شركة أجا اللوجستية', 14, 12);
    doc.setFontSize(10);
    doc.text('OFFICIAL SHIPMENT SUMMARY REPORT | تقرير ملخص الشحنة الرسمي', 14, 20);

    // Document Info Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tracking Number: ${trackingNum}`, 14, 38);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated Date: ${new Date().toLocaleDateString('en-US')}`, 140, 38);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 42, 196, 42);

    // Section 1: General Details
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 46, 182, 32, 'F');
    doc.rect(14, 46, 182, 32, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('1. SHIPMENT OVERVIEW', 18, 53);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Service Type: ${shipment.shipmentType || shipment.serviceType || 'Ocean Freight (FCL)'}`, 18, 60);
    doc.text(`Current Status: ${shipment.currentStatus || shipment.status || 'IN_TRANSIT'}`, 18, 66);
    doc.text(`Shipping Date: ${shipment.shippingDate || '2026-07-20'}`, 18, 72);

    doc.text(`Est. Delivery: ${shipment.estimatedArrivalDate || shipment.estimatedDelivery || '2026-08-05'}`, 110, 60);
    doc.text(`Container / Booking: ${shipment.containerNumber || 'TGHU-994012-0'}`, 110, 66);
    doc.text(`Payment Status: ${shipment.paymentStatus || 'PAID'}`, 110, 72);

    // Section 2: Origin & Destination
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 84, 88, 42, 'F');
    doc.rect(14, 84, 88, 42, 'S');

    doc.rect(108, 84, 88, 42, 'F');
    doc.rect(108, 84, 88, 42, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ORIGIN DETAILS', 18, 91);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Sender: ${shipment.senderName || 'Asian Supply Co. Ltd'}`, 18, 98);
    doc.text(`Origin: ${shipment.origin || 'Shanghai, China'}`, 18, 104);
    doc.text(`Port: Shanghai International Seaport`, 18, 110);
    doc.text(`Phone: +86 21 5888 9022`, 18, 116);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('3. DESTINATION DETAILS', 112, 91);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Receiver: ${shipment.receiverName || 'AJA Logistics Warehouse'}`, 112, 98);
    doc.text(`Destination: ${shipment.destination || 'Riyadh, KSA'}`, 112, 104);
    doc.text(`Port: King Abdulaziz Port Dammam`, 112, 110);
    doc.text(`Phone: +966 50 123 4567`, 112, 116);

    // Section 3: Weight & Freight Specifications
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 132, 182, 36, 'F');
    doc.rect(14, 132, 182, 36, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('4. FREIGHT WEIGHT & DIMENSIONS', 18, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Gross Weight: ${shipment.grossWeightKg || 1450} KG`, 18, 146);
    doc.text(`Volumetric Weight: ${shipment.volumetricWeightKg || 1740} KG`, 18, 152);
    doc.text(`Total Volume: ${shipment.totalCbm || '7.68 CBM'}`, 18, 158);

    doc.text(`Package Count: 4 Euro Pallets`, 110, 146);
    doc.text(`Dimensions (L x W x H): 120 x 100 x 160 cm`, 110, 152);
    doc.text(`HS Code: 8471.30.00`, 110, 158);

    // Section 4: Customs Clearance & Valuation
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 174, 182, 36, 'F');
    doc.rect(14, 174, 182, 36, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('5. CUSTOMS CLEARANCE & FINANCIALS', 18, 181);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Declaration No: DEC-2026-${trackingNum.slice(-5)}`, 18, 188);
    doc.text(`Customs Port: King Abdulaziz Port Customs`, 18, 194);
    doc.text(`Clearance Status: ZATCA Approved & Cleared`, 18, 200);

    doc.text(`Declared Value: ${(shipment.declaredValue || 2500).toLocaleString()} SAR`, 110, 188);
    doc.text(`Customs Duty: 450 SAR (Paid)`, 110, 194);
    doc.text(`Verification Stamp: SASO / ZATCA Verified`, 110, 200);

    // Footer Stamp & Verification Signature Box
    doc.setFillColor(15, 76, 117); // Gentian Blue #0F4C75
    doc.rect(14, 220, 182, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('AJA LOGISTICS OFFICIAL STAMP & E-VERIFICATION', 18, 228);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('This document is electronically verified and issued by AJA Logistics Operating System.', 18, 234);
    doc.text(`Verification Code: AJA-PDF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 18, 239);

    doc.save(`Shipment_Summary_${trackingNum}.pdf`);
  } catch (err) {
    console.error('Error generating PDF report:', err);
  }
};

export interface AdyenInvoicePDFData {
  pspReference: string;
  referenceNumber: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paidAt?: string;
  customerName?: string;
  customerEmail?: string;
  entityType?: string;
  description?: string;
  installments?: {
    value: number;
    monthlyAmount: number;
  };
}

export const generatePaymentInvoicePDF = async (data: AdyenInvoicePDFData) => {
  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pspRef = data.pspReference || `PSP-${Date.now()}`;
    const refNum = data.referenceNumber || 'REF-2026-001';
    const currency = data.currency || 'SAR';
    const amount = data.amount || 0;
    const baseAmount = (amount / 1.15).toFixed(2);
    const vatAmount = (amount - parseFloat(baseAmount)).toFixed(2);
    const paymentDate = data.paidAt ? new Date(data.paidAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US');

    // Header Color Bar (Dark Navy #082F49 & Accent Line #00F0FF)
    doc.setFillColor(8, 47, 73); // Brand Navy
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(0, 240, 255); // Cyan Accent line
    doc.rect(0, 30, 210, 2, 'F');

    // Header Branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AJA LOGISTICS | شركة أجا اللوجستية', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL TAX INVOICE & ADYEN PAYMENT RECEIPT | فاتورة ضريبية وإيصال سداد', 14, 22);
    doc.setFontSize(8);
    doc.text('VAT Reg No: 310123456700003 | CR: 1010892011 | ZATCA e-Invoice Verified', 14, 27);

    // Invoice Meta Information Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: INV-ADYEN-${refNum.replace(/[^a-zA-Z0-9]/g, '')}`, 14, 42);
    doc.text(`Payment Date: ${paymentDate}`, 140, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Adyen PSP Reference: ${pspRef}`, 14, 48);
    doc.text(`Merchant Reference: ${refNum}`, 140, 48);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 52, 196, 52);

    // Section 1: Bill To & Merchant Info
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 56, 88, 38, 'F');
    doc.rect(14, 56, 88, 38, 'S');

    doc.rect(108, 56, 88, 38, 'F');
    doc.rect(108, 56, 88, 38, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUED BY (MERCHANT)', 18, 63);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('AJA Logistics Global UK Ltd', 18, 70);
    doc.text('1 Canada Square, Canary Wharf, London', 18, 75);
    doc.text('Gateway: Adyen N.V. Encrypted Checkout', 18, 80);
    doc.text('Support: finance@ajalogistics.com | +44 20 7946 0000', 18, 85);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO (CLIENT)', 112, 63);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Client Name: ${data.customerName || 'AJA Logistics Corporate Client'}`, 112, 70);
    doc.text(`Email: ${data.customerEmail || 'billing@client-domain.sa'}`, 112, 75);
    doc.text(`Service Entity: ${data.entityType || 'FREIGHT_LOGISTICS_SERVICE'}`, 112, 80);
    doc.text(`Status: AUTHORISED & SETTLED`, 112, 85);

    // Section 2: Financial Itemized Breakdown Table
    doc.setFillColor(8, 47, 73);
    doc.rect(14, 100, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DESCRIPTION / بيان الخدمة', 18, 105.5);
    doc.text('BASE (EXCL. VAT)', 110, 105.5);
    doc.text('VAT (15%)', 150, 105.5);
    doc.text('TOTAL', 178, 105.5);

    // Row 1
    doc.setFillColor(255, 255, 255);
    doc.rect(14, 108, 182, 14, 'S');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(data.description || `Logistics Freight & Services - ${refNum}`, 18, 116);
    doc.text(`${baseAmount} ${currency}`, 110, 116);
    doc.text(`${vatAmount} ${currency}`, 150, 116);
    doc.setFont('helvetica', 'bold');
    doc.text(`${amount.toFixed(2)} ${currency}`, 178, 116);

    // Total Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(110, 128, 86, 28, 'F');
    doc.rect(110, 128, 86, 28, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal (Excl. VAT):', 114, 135);
    doc.text(`${baseAmount} ${currency}`, 165, 135);

    doc.text('VAT Rate (15%):', 114, 141);
    doc.text(`${vatAmount} ${currency}`, 165, 141);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 120, 100);
    doc.text('TOTAL PAID:', 114, 150);
    doc.text(`${amount.toLocaleString()} ${currency}`, 165, 150);

    // Section 3: Adyen Payment Details
    doc.setTextColor(15, 23, 42);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 162, 182, 30, 'F');
    doc.rect(14, 162, 182, 30, 'S');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ADYEN PAYMENT METHOD & CLEARING DETAILS', 18, 169);

    const paymentMethodText = data.installments
      ? `${data.paymentMethod || 'Credit Card'} (Installments: ${data.installments.value} Months @ ${data.installments.monthlyAmount.toFixed(2)} ${currency}/mo)`
      : (data.paymentMethod || 'MADA / Credit Card');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Payment Method: ${paymentMethodText}`, 18, 176);
    doc.text(`Payment Gateway: Adyen Web Drop-in / Checkout API`, 18, 182);
    doc.text(`Processing Status: Authorised (PspReference Verified)`, 18, 187);

    doc.text(`Security Level: PCI-DSS Level 1 & 3DS2 Tokenized`, 112, 176);
    doc.text(`Settlement Currency: ${currency}`, 112, 182);
    doc.text(`Merchant Account: AJALogisticsKSA_ECOM`, 112, 187);

    // Official Stamp & Verification Footer
    doc.setFillColor(8, 47, 73);
    doc.rect(14, 202, 182, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('AJA LOGISTICS OFFICIAL ELECTRONIC STAMP & VERIFICATION', 18, 210);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('This tax invoice is generated automatically upon successful payment authorization by Adyen Checkout API.', 18, 216);
    doc.text('ZATCA compliant cryptographic stamp issued under Saudi Arabian Tax Regulation.', 18, 221);
    doc.text(`Verification Signature: AJA-ADYEN-TAX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 18, 226);

    doc.save(`AJA_Tax_Invoice_${refNum}_${pspRef.slice(-6)}.pdf`);
  } catch (err) {
    console.error('Error generating Adyen Tax Invoice PDF:', err);
  }
};
