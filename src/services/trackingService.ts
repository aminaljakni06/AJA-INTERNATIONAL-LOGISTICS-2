import { 
  DetailedShipment, 
  MOCK_SHIPMENTS_DATABASE, 
  generateDynamicShipment 
} from '../data/shipmentsData';

export interface TrackingResponse {
  success: boolean;
  shipment?: DetailedShipment;
  error?: string;
  source?: 'LOCAL_MOCK_DATABASE' | 'DYNAMIC_GENERATOR' | 'REMOTE_TRACKING_API';
}

/**
 * Tracking Service Data Abstraction Layer
 * Separates data operations from UI view layers.
 * Fully prepared for drop-in integration with external tracking APIs,
 * backend REST/GraphQL services, ERP systems (SAP, Oracle, Odoo),
 * and Logistics Management Systems (LMS / TMS).
 */
export async function trackShipmentByNumber(trackingNum: string): Promise<TrackingResponse> {
  const cleanTracking = trackingNum ? trackingNum.trim().toUpperCase() : '';

  // 1. Empty State Guard
  if (!cleanTracking) {
    return {
      success: false,
      error: 'يرجى إدخال رقم التتبع لمتابعة الشحنة (Please enter a valid tracking number)',
    };
  }

  // Simulate network latency (300ms) for smooth loading state transitions in UI
  await new Promise((resolve) => setTimeout(resolve, 320));

  // 2. Explicit Error State Test Case Trigger
  if (cleanTracking === 'ERR-INVALID-999' || cleanTracking === 'NOTFOUND' || cleanTracking === '000000') {
    return {
      success: false,
      error: 'عذراً، لم يتم العثور على أي شحنة مسجلة بهذا الرقم. يرجى التأكد من الرقم والتجربة مرة أخرى.',
    };
  }

  // 3. Match against structured database repository
  if (MOCK_SHIPMENTS_DATABASE[cleanTracking]) {
    return {
      success: true,
      shipment: MOCK_SHIPMENTS_DATABASE[cleanTracking],
      source: 'LOCAL_MOCK_DATABASE',
    };
  }

  // 4. Remote API Endpoint Integration Hook (Ready for Real Backend / ERP / LMS)
  try {
    const apiResponse = await fetch(`/api/shipments/track/${encodeURIComponent(cleanTracking)}`);
    if (apiResponse.ok) {
      const serverData = await apiResponse.json();
      if (serverData && serverData.trackingNumber) {
        return {
          success: true,
          shipment: serverData,
          source: 'REMOTE_TRACKING_API',
        };
      }
    }
  } catch (e) {
    // Graceful fallback to dynamic generator when backend endpoint is not active
    console.info('[TrackingService] Remote API fallback active. Serving dynamic shipment dataset for demo.');
  }

  // 5. Fallback Dynamic Shipment Generator for demonstration
  const dynamicShipment = generateDynamicShipment(cleanTracking);
  return {
    success: true,
    shipment: dynamicShipment,
    source: 'DYNAMIC_GENERATOR',
  };
}

/**
 * Helper to fetch a list of sample tracking numbers for quick UI testing
 */
export function getSampleTrackingNumbers(): { code: string; labelAr: string; labelEn: string; status: string }[] {
  return [
    { code: 'AJA-2026-000001', labelAr: 'بحري - قيد الشحن', labelEn: 'Sea - In Transit', status: 'IN_TRANSIT' },
    { code: 'AJA-889021', labelAr: 'بريري - في الجمرك', labelEn: 'Customs Clearance', status: 'AT_CUSTOMS' },
    { code: 'AJA-104928', labelAr: 'مكتملة - تم التسليم', labelEn: 'Delivered', status: 'DELIVERED' },
    { code: 'ERR-INVALID-999', labelAr: 'تجربة رقم غير متاح (خطأ)', labelEn: 'Error Test Code', status: 'ERROR' },
  ];
}
