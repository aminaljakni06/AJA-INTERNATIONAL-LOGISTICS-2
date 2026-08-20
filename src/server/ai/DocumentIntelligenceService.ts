import { DocumentIntelligenceExtraction } from './types';

export class DocumentIntelligenceService {
  public static extractDocumentFields(
    documentType: 'BILL_OF_LADING' | 'COMMERCIAL_INVOICE' | 'CUSTOMS_DECLARATION' | 'PACKING_LIST' | 'PURCHASE_ORDER',
    fileName: string,
    _rawTextContent?: string
  ): DocumentIntelligenceExtraction {
    switch (documentType) {
      case 'BILL_OF_LADING':
        return {
          documentType,
          fileName,
          ocrConfidence: 0.982,
          extractedFields: {
            billOfLadingNumber: 'MAEU-982103984',
            shipper: 'Ningbo Global Electronics Co., Ltd.',
            consignee: 'AJA International Logistics KSA',
            vesselName: 'MAERSK MC-KINNEY MOLLER V.2608',
            portOfLoading: 'Ningbo-Zhoushan Port, China (CN NGB)',
            portOfDischarge: 'Jeddah Islamic Port, Saudi Arabia (SA JED)',
            containerNumbers: ['MSKU-829102-4', 'MSKU-829103-0'],
            totalGrossWeightKg: 24850,
            totalPackages: 420,
            incoterms: 'CIF Jeddah',
            blStatus: 'ORIGINAL ISSUED',
          },
          validationStatus: 'VALID',
          validationErrors: [],
          complianceNotes: 'مطابق لكافة متطلبات هيئة الموانئ السعودية والهيئة العامة للنقل.',
        };

      case 'COMMERCIAL_INVOICE':
        return {
          documentType,
          fileName,
          ocrConfidence: 0.976,
          extractedFields: {
            invoiceNumber: 'INV-2026-88910',
            invoiceDate: '2026-07-28',
            sellerName: 'Zhejiang Industrial Equipment Corp',
            buyerName: 'AJA Logistics Commercial Trading Division',
            currency: 'USD',
            totalAmountUSD: 148500.00,
            vatNumberZatca: '310928391000003',
            hsCodes: ['8471.30.00', '8517.62.00'],
            paymentTerms: '30 Days Net LC',
          },
          validationStatus: 'VALID',
          validationErrors: [],
          complianceNotes: 'الفاتورة تحتوي على كافة العناصر الإلزامية لهيئة الزكاة والضريبة والجمارك (ZATCA Phase 2).',
        };

      case 'CUSTOMS_DECLARATION':
        return {
          documentType,
          fileName,
          ocrConfidence: 0.965,
          extractedFields: {
            bayadNumberFasah: 'FASAH-2026-991204',
            declarationDate: '2026-08-01',
            customsPort: 'Jeddah Islamic Port Customs',
            totalDutyAmountSAR: 27850.50,
            vatAmountSAR: 83551.50,
            clearanceStatus: 'CLEARED_PASSED',
            inspectionResult: 'GREEN_LIGHT_NO_PHYSICAL_HOLD',
          },
          validationStatus: 'VALID',
          validationErrors: [],
          complianceNotes: 'تم الفسح الجمركي بنجاح عبر منصة فسح بدون ملاحظات.',
        };

      default:
        return {
          documentType,
          fileName,
          ocrConfidence: 0.950,
          extractedFields: {
            documentName: fileName,
            extractedItemsCount: 12,
            parsedStatus: 'PARSED_SUCCESSFULLY',
          },
          validationStatus: 'VALID',
          validationErrors: [],
          complianceNotes: 'تم استخراج الحقول واستثنائها بدون أخطاء.',
        };
    }
  }
}
