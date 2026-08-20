import { Shipment, ShipmentStatus, ShipmentEvent } from '../types/shipment';
import { QuoteRequest, QuoteRequestStatus, ServiceType } from '../types/quote';

export interface RequiredDocumentInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  required: boolean;
  descriptionAr: string;
  category: 'CUSTOMS' | 'SHIPPING' | 'COMMERCIAL' | 'COMPLIANCE';
}

export interface AvailableServiceInfo {
  id: ServiceType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  iconName: string;
  estimatedTransitDays: string;
  suitableFor: string;
}

/**
 * 1. getShipmentStatus
 * Fetches real-time shipment status, location, estimated delivery, and progress percentage.
 */
export async function getShipmentStatus(trackingNumber: string): Promise<{
  success: boolean;
  shipment?: Shipment;
  progressPercent?: number;
  statusLabelAr?: string;
  error?: string;
}> {
  try {
    const cleanNum = trackingNumber.trim();
    if (!cleanNum) {
      return { success: false, error: 'يرجى إدخال رقم التتبع' };
    }

    const res = await fetch(`/api/shipments/track/${encodeURIComponent(cleanNum)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'لم يتم العثور على شحنة بهذا الرقم' };
    }

    const shipment: Shipment = await res.json();
    
    // Calculate progress percentage based on status
    const statusProgressMap: Record<ShipmentStatus, number> = {
      RECEIVED: 10,
      BOOKING_CONFIRMED: 25,
      PREPARING: 40,
      LOADING: 50,
      IN_TRANSIT: 65,
      ARRIVED_AT_PORT: 80,
      DEPARTURE_CUSTOMS: 85,
      CUSTOMS_CLEARANCE: 90,
      OUT_FOR_DELIVERY: 95,
      DELIVERED: 100,
      CANCELLED: 0,
    };

    const statusLabelsAr: Record<ShipmentStatus, string> = {
      RECEIVED: 'تم الاستلام في النظام',
      BOOKING_CONFIRMED: 'تم تأكيد الحجز',
      PREPARING: 'جاري تجهيز الشحنة',
      LOADING: 'تم التحميل',
      IN_TRANSIT: 'في الطريق / قيد النقل',
      ARRIVED_AT_PORT: 'وصلت الميناء / المنفذ',
      DEPARTURE_CUSTOMS: 'الجمارك عند المغادرة',
      CUSTOMS_CLEARANCE: 'التطهير / التخليص الجمركي',
      OUT_FOR_DELIVERY: 'خرجت للتسليم',
      DELIVERED: 'تم التسليم بنجاح',
      CANCELLED: 'ملغاة',
    };

    return {
      success: true,
      shipment,
      progressPercent: statusProgressMap[shipment.status] || 0,
      statusLabelAr: statusLabelsAr[shipment.status] || shipment.status,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء استعلام حالة الشحنة' };
  }
}

/**
 * 2. getShipmentTimeline
 * Retrieves chronological tracking events and movement timeline for a shipment.
 */
export async function getShipmentTimeline(trackingNumber: string): Promise<{
  success: boolean;
  events: ShipmentEvent[];
  error?: string;
}> {
  try {
    const result = await getShipmentStatus(trackingNumber);
    if (!result.success || !result.shipment) {
      return { success: false, events: [], error: result.error };
    }

    const events = result.shipment.events || [];
    // Sort events chronologically (newest first)
    const sorted = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      success: true,
      events: sorted,
    };
  } catch (err: any) {
    return { success: false, events: [], error: err.message || 'فشل جلب جدول أحداث الشحنة' };
  }
}

/**
 * 3. getCustomerShipments
 * Fetches all shipments belonging to the authenticated customer.
 */
export async function getCustomerShipments(authToken?: string): Promise<{
  success: boolean;
  shipments: Shipment[];
  error?: string;
}> {
  try {
    const token = authToken || localStorage.getItem('aja_auth_token');
    if (!token) {
      return { success: false, shipments: [], error: 'يرجى تسجيل الدخول لعرض الشحنات' };
    }

    const res = await fetch('/api/shipments', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, shipments: [], error: errData.error || 'فشل استدعاء الشحنات' };
    }

    const shipments: Shipment[] = await res.json();
    return { success: true, shipments };
  } catch (err: any) {
    return { success: false, shipments: [], error: err.message || 'خطأ في الاتصال بالشبكة' };
  }
}

/**
 * 4. getQuoteStatus
 * Checks status, offered price, and admin notes for a submitted quote request.
 */
export async function getQuoteStatus(quoteId: string, authToken?: string): Promise<{
  success: boolean;
  quote?: QuoteRequest;
  statusLabelAr?: string;
  error?: string;
}> {
  try {
    const token = authToken || localStorage.getItem('aja_auth_token');
    if (!token) {
      return { success: false, error: 'غير مسجل الدخول' };
    }

    const res = await fetch('/api/quotes', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { success: false, error: 'فشل جلب طلبات عروض الأسعار' };
    }

    const quotes: QuoteRequest[] = await res.json();
    const found = quotes.find((q) => q.id === quoteId || q.id.endsWith(quoteId));

    if (!found) {
      return { success: false, error: 'لم يتم العثور على طلب العرض المطلوب' };
    }

    const statusLabelsAr: Record<QuoteRequestStatus, string> = {
      NEW: 'جديد - قيد الانتظار',
      UNDER_REVIEW: 'قيد الدراسة والمراجعة',
      CONTACTED: 'تم التواصل مع العميل',
      QUOTE_SENT: 'تم إرسال عرض السعر',
      NEGOTIATING: 'قيد التفاوض',
      AGREED: 'تمت الموافقة والاعتماد',
      REJECTED: 'مرفوض',
      CLOSED: 'مغلق',
    };

    return {
      success: true,
      quote: found,
      statusLabelAr: statusLabelsAr[found.status] || found.status,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطأ في الاستعلام عن عرض السعر' };
  }
}

/**
 * 5. getRequiredDocuments
 * Returns mandatory & optional compliance documents required for customs clearance & shipping based on service type.
 */
export function getRequiredDocuments(
  serviceType: ServiceType,
  originCountry: string = 'الصين',
  destinationCountry: string = 'السعودية'
): RequiredDocumentInfo[] {
  const commonDocs: RequiredDocumentInfo[] = [
    {
      id: 'doc-invoice',
      nameAr: 'الفاتورة التجارية (Commercial Invoice)',
      nameEn: 'Commercial Invoice',
      required: true,
      descriptionAr: 'فاتورة توضح قيمة البضائع والأصناف بالتفصيل ومصادق عليها.',
      category: 'COMMERCIAL',
    },
    {
      id: 'doc-packing-list',
      nameAr: 'قائمة التعبئة (Packing List)',
      nameEn: 'Packing List',
      required: true,
      descriptionAr: 'قائمة تبين الأوزان والأحجام وعدد الطرود والكراتين.',
      category: 'SHIPPING',
    },
  ];

  if (serviceType === 'SEA_FREIGHT') {
    return [
      ...commonDocs,
      {
        id: 'doc-bl',
        nameAr: 'بوليسة الشحن البحري (Bill of Lading - B/L)',
        nameEn: 'Bill of Lading',
        required: true,
        descriptionAr: 'سند ملكية البضائع المشحونة عبر الناقل البحري.',
        category: 'SHIPPING',
      },
      {
        id: 'doc-[#co]',
        nameAr: 'شهادة المنشأ (Certificate of Origin)',
        nameEn: 'Certificate of Origin',
        required: true,
        descriptionAr: 'شهادة تثبت البلد المصنّع للبضائع.',
        category: 'COMPLIANCE',
      },
      {
        id: 'doc-saber',
        nameAr: 'شهادة مطابقة سابر / فاسح (SABER / FASAHE)',
        nameEn: 'SABER Conformity Certificate',
        required: destinationCountry.includes('السعودية'),
        descriptionAr: 'شهادة المطابقة المطلوبة للفسح الجمركي بالمملكة العربية السعودية.',
        category: 'CUSTOMS',
      },
    ];
  }

  if (serviceType === 'LAND_FREIGHT') {
    return [
      ...commonDocs,
      {
        id: 'doc-cmr',
        nameAr: 'بيان الشحنة البرية (CMR Waybill)',
        nameEn: 'CMR Land Waybill',
        required: true,
        descriptionAr: 'وثيقة نقل البضائع بالبر عبر الحدود والشاحنات.',
        category: 'SHIPPING',
      },
      {
        id: 'doc-manifest',
        nameAr: 'منافيست الشاحنة والبيان الجمركي',
        nameEn: 'Truck Manifest',
        required: true,
        descriptionAr: 'قائمة حمولة الشاحنة للعبور الحدودي.',
        category: 'CUSTOMS',
      },
    ];
  }

  if (serviceType === 'CUSTOMS_CLEARANCE') {
    return [
      ...commonDocs,
      {
        id: 'doc-auth-letter',
        nameAr: 'تفويض التخليص الجمركي (FASAH Authorization)',
        nameEn: 'Customs Clearance Power of Attorney',
        required: true,
        descriptionAr: 'تفويض المخلص الجمركي في منصة فسح الإلكترونية.',
        category: 'CUSTOMS',
      },
      {
        id: 'doc-saber',
        nameAr: 'شهادة المطابقة الجمركية (SABER)',
        nameEn: 'SABER Certificate',
        required: true,
        descriptionAr: 'إقرار مطابقة المنتجات لشروط الهيئة السعودية للمواصفات.',
        category: 'COMPLIANCE',
      },
    ];
  }

  // Default for WAREHOUSING or DOOR_TO_DOOR
  return [
    ...commonDocs,
    {
      id: 'doc-delivery-order',
      nameAr: 'إذن التسليم والتسلم (Delivery Order)',
      nameEn: 'Delivery Order',
      required: true,
      descriptionAr: 'وثيقة أمرين الاستلام والتسليم للمستودعات.',
      category: 'SHIPPING',
    },
  ];
}

/**
 * 6. getAvailableServices
 * Returns the catalog of active logistics services provided by Aja Logistics.
 */
export function getAvailableServices(): AvailableServiceInfo[] {
  return [
    {
      id: 'SEA_FREIGHT',
      titleAr: 'الشحن البحري الدولي (FCL / LCL)',
      titleEn: 'Ocean Freight Shipping',
      descriptionAr: 'نقل الحاويات الكاملة (FCL) والحمولات المجزأة (LCL) من كافة الموانئ العالمية كالموانئ الصينية إلى الموانئ السعودية والخليجية.',
      iconName: 'Ship',
      estimatedTransitDays: '18 - 28 يوم',
      suitableFor: 'البضائع الثقيلة، الشحنات الضخمة، والكميات التجارية الكبيره.',
    },
    {
      id: 'LAND_FREIGHT',
      titleAr: 'النقل البري والأسطول الداخلي والإقليمي',
      titleEn: 'Land Trucking & Freight',
      descriptionAr: 'أسطول شاحنات مجهز لنقل البضائع بين مدن المملكة ودول الخليج العربي والشرق الأوسط بسرعة وكفاءة عالية.',
      iconName: 'Truck',
      estimatedTransitDays: '2 - 5 أيام',
      suitableFor: 'الشحنات الإقليمية، النقل السريع بين المدن، والبضائع المجزأة.',
    },
    {
      id: 'CUSTOMS_CLEARANCE',
      titleAr: 'التخليص الجمركي والاستشارات الجمركية',
      titleEn: 'Customs Clearance Services',
      descriptionAr: 'تخليص سريع للبضائع في جميع المنافذ البحرية والبرية والجوية (ميناء جده، ميناء الملك عبد العزيز، ميناء الدمام، مطار الملك خالد) عبر منصة فسح.',
      iconName: 'ShieldCheck',
      estimatedTransitDays: '1 - 3 أيام',
      suitableFor: 'جميع الواردات والصادرات الخاضعة للشروط والفسح الجمركي.',
    },
    {
      id: 'WAREHOUSING',
      titleAr: 'التخزين والحلول اللوجستية والتوزيع',
      titleEn: 'Warehousing & Logistics',
      descriptionAr: 'مستودعات آمنة ومجهزة ومكيفة للتخزين قصير وطويل المدى، مع إدارة المخزون والتعبئة والتغليف.',
      iconName: 'Warehouse',
      estimatedTransitDays: 'حسب الطلب',
      suitableFor: 'تخزين البضائع، إعادة التعبئة، وإدارة سلاسل الإمداد.',
    },
    {
      id: 'DOOR_TO_DOOR',
      titleAr: 'خدمة النقل الشامل من الباب إلى الباب',
      titleEn: 'Door to Door All-Inclusive',
      descriptionAr: 'حل متكامل يشمل الشحن والتخليص والتوصيل المباشر لموقع العميل أو المستودع دون عناء.',
      iconName: 'PackageCheck',
      estimatedTransitDays: 'حسب المسار والوسيلة',
      suitableFor: 'الشركات والأفراد الراغبين في خدمة متكاملة ومستريحة.',
    },
  ];
}
