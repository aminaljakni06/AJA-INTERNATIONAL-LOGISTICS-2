import React from 'react';
import { Badge } from './Badge';
import { QuoteRequestStatus } from '../../types/quote';
import { ShipmentStatus } from '../../types/shipment';
import { useLanguage } from '../../i18n/LanguageContext';

interface StatusBadgeProps {
  type: 'quote' | 'shipment';
  status: QuoteRequestStatus | ShipmentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  const { t } = useLanguage();

  if (type === 'quote') {
    const quoteStatusMap: Record<
      string,
      { label: string; variant: 'active' | 'pending' | 'completed' | 'slate'; showDot?: boolean }
    > = {
      NEW: { label: t.quoteStatus.NEW, variant: 'pending', showDot: true },
      UNDER_REVIEW: { label: t.quoteStatus.UNDER_REVIEW, variant: 'pending', showDot: true },
      CONTACTED: { label: t.quoteStatus.CONTACTED, variant: 'pending' },
      QUOTE_SENT: { label: t.quoteStatus.QUOTE_SENT, variant: 'active', showDot: true },
      NEGOTIATING: { label: t.quoteStatus.NEGOTIATING, variant: 'active', showDot: true },
      AGREED: { label: t.quoteStatus.AGREED, variant: 'completed' },
      REJECTED: { label: t.quoteStatus.REJECTED, variant: 'slate' },
      CLOSED: { label: t.quoteStatus.CLOSED, variant: 'completed' },
    };

    const config = quoteStatusMap[status] || { label: status, variant: 'pending' };
    return <Badge variant={config.variant} dot={config.showDot}>{config.label}</Badge>;
  }

  const shipmentStatusMap: Record<
    string,
    { label: string; variant: 'created' | 'in-transit' | 'at-customs' | 'out-for-delivery' | 'delivered' | 'error'; showDot?: boolean }
  > = {
    SHIPMENT_CREATED: { label: 'تم إنشاء الشحنة', variant: 'created', showDot: true },
    CREATED: { label: 'تم إنشاء الشحنة', variant: 'created', showDot: true },
    RECEIVED: { label: t.shipmentStatus.RECEIVED, variant: 'created', showDot: true },
    BOOKED: { label: 'حجز مؤكد', variant: 'created', showDot: true },
    BOOKING_CONFIRMED: { label: t.shipmentStatus.BOOKING_CONFIRMED, variant: 'created', showDot: true },
    PREPARING: { label: t.shipmentStatus.PREPARING, variant: 'created', showDot: true },
    PICKED_UP: { label: 'تم الاستلام والتجهيز', variant: 'created', showDot: true },
    PICKUP: { label: 'تم الاستلام والتجهيز', variant: 'created', showDot: true },

    IN_TRANSIT: { label: t.shipmentStatus.IN_TRANSIT, variant: 'in-transit', showDot: true },
    AT_PORT: { label: 'في ميناء التجميع', variant: 'in-transit', showDot: true },
    LOADED: { label: 'تم التحميل على الناقل', variant: 'in-transit', showDot: true },
    LOADING: { label: t.shipmentStatus.LOADING, variant: 'in-transit', showDot: true },
    ARRIVED_AT_PORT: { label: t.shipmentStatus.ARRIVED_AT_PORT, variant: 'in-transit', showDot: true },

    AT_CUSTOMS: { label: 'في الفسح الجمركي', variant: 'at-customs', showDot: true },
    CUSTOMS: { label: 'تخليص جمركي', variant: 'at-customs', showDot: true },
    CUSTOMS_CLEARANCE: { label: t.shipmentStatus.CUSTOMS_CLEARANCE, variant: 'at-customs', showDot: true },

    OUT_FOR_DELIVERY: { label: t.shipmentStatus.OUT_FOR_DELIVERY, variant: 'out-for-delivery', showDot: true },

    DELIVERED: { label: t.shipmentStatus.DELIVERED, variant: 'delivered', showDot: true },

    ERROR: { label: 'خطأ / إلغاء', variant: 'error', showDot: true },
    CANCELLED: { label: 'ملغاة', variant: 'error', showDot: true },
  };

  const config = shipmentStatusMap[status] || { label: status, variant: 'created' };
  return <Badge variant={config.variant} dot={config.showDot}>{config.label}</Badge>;
};

