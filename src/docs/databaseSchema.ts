/**
 * AJA LOGISTICS - Database Schema Architecture Specification
 * Design for: USER, CUSTOMER, COMPANY, QUOTE_REQUEST, SHIPMENT, SHIPMENT_EVENT, SERVICE, LOCATION, NOTIFICATION
 */

export interface SchemaField {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  isNullable: boolean;
  description: string;
}

export interface SchemaIndex {
  name: string;
  fields: string[];
  isUnique?: boolean;
  purpose: string;
}

export interface EntitySchema {
  tableName: string;
  descriptionAr: string;
  descriptionEn: string;
  primaryKey: string;
  fields: SchemaField[];
  indexes: SchemaIndex[];
  relationships: {
    targetEntity: string;
    type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
    foreignKey: string;
    description: string;
  }[];
}

export const AJA_LOGISTICS_DATABASE_SCHEMA: Record<string, EntitySchema> = {
  USER: {
    tableName: 'users',
    descriptionAr: 'جدول المستخدمين لنظام المصادقة والصلاحيات (عملاء، موظفون، أدمن)',
    descriptionEn: 'Authentication & Role Management Users Table',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36) / String', isPrimaryKey: true, isNullable: false, description: 'المعرف الفريد للمستخدم' },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'البريد الإلكتروني المعتمد للمسخدم' },
      { name: 'phone', type: 'VARCHAR(32)', isNullable: true, description: 'رقم الهاتف المعتمد للمصادقة بالتأكيد' },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: true, description: 'تشفير كلمة المرور (عند المصادقة المحلية)' },
      { name: 'role', type: "ENUM('CUSTOMER', 'STAFF', 'ADMIN')", isNullable: false, description: 'دور المستخدم ونطاق الصلاحيات' },
      { name: 'status', type: "ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')", isNullable: false, description: 'حالة الحساب الحالية' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ إنشاء الحساب' },
      { name: 'updated_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ آخر تحديث' },
    ],
    indexes: [
      { name: 'idx_users_email', fields: ['email'], isUnique: true, purpose: 'تسجيل الدخول والبحث السريع بالبريد' },
      { name: 'idx_users_phone', fields: ['phone'], isUnique: false, purpose: 'التفتيش والتواصل السريع' },
      { name: 'idx_users_role_status', fields: ['role', 'status'], purpose: 'فلترة المستخدمين حسب الصلاحيات والحالة' },
    ],
    relationships: [
      { targetEntity: 'CUSTOMER', type: 'ONE_TO_ONE', foreignKey: 'user_id', description: 'ربط المستخدم بملف العملاء' },
      { targetEntity: 'NOTIFICATION', type: 'ONE_TO_MANY', foreignKey: 'recipient_user_id', description: 'الإشعارات الموجهة للمستخدم' },
    ]
  },

  CUSTOMER: {
    tableName: 'customers',
    descriptionAr: 'بيانات وإعدادات العميل (شركة أو فرد) وحساب الأعمال',
    descriptionEn: 'Customer Profiles & Commercial Accounts',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36) / String', isPrimaryKey: true, isNullable: false, description: 'المعرف الفريد للعميل' },
      { name: 'user_id', type: 'VARCHAR(36) / String', isForeignKey: true, references: 'users.id', isNullable: false, description: 'ربط الحساب بجدول المستخدمين' },
      { name: 'company_id', type: 'VARCHAR(36) / String', isForeignKey: true, references: 'companies.id', isNullable: true, description: 'الشركة المنتسب لها العميل (إن وجد)' },
      { name: 'full_name', type: 'VARCHAR(191)', isNullable: false, description: 'الاسم الكامل للعميل' },
      { name: 'phone', type: 'VARCHAR(32)', isNullable: false, description: 'رقم جوال العميل للتواصل والتنبيهات' },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'البريد الإلكتروني للعميل' },
      { name: 'tax_number', type: 'VARCHAR(64)', isNullable: true, description: 'الرقم الضريبي الخاص بالعميل' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ الانضمام' },
      { name: 'updated_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ التحديث' },
    ],
    indexes: [
      { name: 'idx_customers_user_id', fields: ['user_id'], isUnique: true, purpose: 'الوصول الفوري لملف العميل عبر حساب المستخدم' },
      { name: 'idx_customers_company_id', fields: ['company_id'], purpose: 'تجميع عملاء الشركة الواحدة' },
    ],
    relationships: [
      { targetEntity: 'QUOTE_REQUEST', type: 'ONE_TO_MANY', foreignKey: 'customer_id', description: 'طلبات التسعير المقدمة من العميل' },
      { targetEntity: 'SHIPMENT', type: 'ONE_TO_MANY', foreignKey: 'customer_id', description: 'الشحنات المملوكة للعميل' },
    ]
  },

  COMPANY: {
    tableName: 'companies',
    descriptionAr: 'سجلات الشركات والمنشآت التجارية والشركاء اللوجستيين',
    descriptionEn: 'Commercial Enterprise & Logistics Partner Accounts',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'معرف الشركة' },
      { name: 'name_ar', type: 'VARCHAR(255)', isNullable: false, description: 'اسم الشركة بالعربية' },
      { name: 'name_en', type: 'VARCHAR(255)', isNullable: true, description: 'اسم الشركة بالإنجليزية' },
      { name: 'commercial_register', type: 'VARCHAR(64)', isNullable: true, description: 'رقم السجل التجاري (CR)' },
      { name: 'vat_number', type: 'VARCHAR(64)', isNullable: true, description: 'الرقم الضريبي للشركة' },
      { name: 'address', type: 'TEXT', isNullable: true, description: 'العنوان الوطني أو الرئيسي' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ الإنشاء' },
    ],
    indexes: [
      { name: 'idx_companies_cr', fields: ['commercial_register'], isUnique: true, purpose: 'البحث بسجل المنشأة' },
    ],
    relationships: [
      { targetEntity: 'CUSTOMER', type: 'ONE_TO_MANY', foreignKey: 'company_id', description: 'الموظفون / العملاء التابعون للشركة' },
    ]
  },

  QUOTE_REQUEST: {
    tableName: 'quote_requests',
    descriptionAr: 'طلبات أسعار الشحن المقدمة من العملاء والمعالجة اللوجستية',
    descriptionEn: 'Freight Quote Requests & Negotiated Rates',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'المعرف الفريد لطلب السعر' },
      { name: 'request_number', type: 'VARCHAR(64)', isNullable: false, description: 'الرقم المرجعي (مثل: AJA-REQ-2026-001)' },
      { name: 'customer_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'customers.id', isNullable: false, description: 'العميل صاحب الطلب' },
      { name: 'service_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'services.id', isNullable: true, description: 'الخدمة اللوجستية المطلوبة' },
      { name: 'shipment_type', type: "ENUM('SEA_FREIGHT', 'AIR_FREIGHT', 'LAND_FREIGHT', 'CUSTOMS_CLEARANCE', 'WAREHOUSING')", isNullable: false, description: 'نمط ونوع الشحن' },
      { name: 'origin_location_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'locations.id', isNullable: true, description: 'موقع الانطلاق المحوري' },
      { name: 'destination_location_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'locations.id', isNullable: true, description: 'موقع الوصول النهائي' },
      { name: 'pickup_location', type: 'TEXT', isNullable: false, description: 'وصف نصي لموقع الاستلام' },
      { name: 'delivery_location', type: 'TEXT', isNullable: false, description: 'وصف نصي لموقع التسليم' },
      { name: 'cargo_type', type: 'VARCHAR(191)', isNullable: false, description: 'نوع البضاعة والمواصفات' },
      { name: 'approximate_weight', type: 'DECIMAL(10,2)', isNullable: true, description: 'الوزن التقريبي بالكيلوجرام' },
      { name: 'status', type: "ENUM('NEW', 'UNDER_REVIEW', 'QUOTE_SENT', 'AGREED', 'REJECTED', 'CLOSED')", isNullable: false, description: 'حالة معالجة الطلب' },
      { name: 'offered_price', type: 'DECIMAL(12,2)', isNullable: true, description: 'السعر المعروض من قسم المبيعات' },
      { name: 'currency', type: 'VARCHAR(3)', isNullable: false, description: 'عملة العرض (SAR, USD)' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ تقديم الطلب' },
    ],
    indexes: [
      { name: 'idx_quote_requests_req_num', fields: ['request_number'], isUnique: true, purpose: 'البحث برقم طلب التسعير' },
      { name: 'idx_quote_requests_customer_id', fields: ['customer_id'], purpose: 'استعراض طلبات العميل' },
      { name: 'idx_quote_requests_status', fields: ['status'], purpose: 'متابعة الطلبات الجديدة وغير المعالجة' },
    ],
    relationships: [
      { targetEntity: 'CUSTOMER', type: 'MANY_TO_ONE', foreignKey: 'customer_id', description: 'العميل صاحبت الطلب' },
      { targetEntity: 'SHIPMENT', type: 'ONE_TO_ONE', foreignKey: 'quote_request_id', description: 'الشحنة الصادرة من هذا العرض المقبول' },
    ]
  },

  SHIPMENT: {
    tableName: 'shipments',
    descriptionAr: 'جدول الشحنات الرئيسي ومتابعة الحالة والموقع والبيانات التشغيلية',
    descriptionEn: 'Core Shipments Lifecycle, Routing & Operational Meta',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'المعرف الفريد للشحنة' },
      { name: 'tracking_number', type: 'VARCHAR(64)', isNullable: false, description: 'رقم التتبع المباشر (مثل: AJA-2026-000001)' },
      { name: 'customer_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'customers.id', isNullable: false, description: 'مالك الشحنة' },
      { name: 'quote_request_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'quote_requests.id', isNullable: true, description: 'طلب التسعير المرتبط' },
      { name: 'shipment_type', type: "ENUM('SEA_FREIGHT', 'AIR_FREIGHT', 'LAND_FREIGHT', 'CUSTOMS_CLEARANCE', 'WAREHOUSING')", isNullable: false, description: 'وسيلة ونوع الشحن' },
      { name: 'origin_location_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'locations.id', isNullable: true, description: 'مرفق الانطلاق المرجعي' },
      { name: 'destination_location_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'locations.id', isNullable: true, description: 'مرفق التسليم المرجعي' },
      { name: 'pickup_location', type: 'TEXT', isNullable: false, description: 'عنوان الاستلام تفصيلياً' },
      { name: 'delivery_location', type: 'TEXT', isNullable: false, description: 'عنوان التسليم النهائي' },
      { name: 'current_status', type: "ENUM('BOOKED', 'PICKUP', 'AT_PORT', 'LOADED', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED')", isNullable: false, description: 'المرحلة الرئيسية الحالية للشحنة' },
      { name: 'current_location', type: 'VARCHAR(255)', isNullable: true, description: 'الموقع المباشر (GPS Feed)' },
      { name: 'estimated_delivery', type: 'DATE', isNullable: true, description: 'التاريخ المتوقع للوصول' },
      { name: 'external_carrier_ref', type: 'VARCHAR(128)', isNullable: true, description: 'رقم تتبع الناقل الخارجي للتكامل مستقبلاً (API)' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ تسجيل الشحنة' },
      { name: 'updated_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ التحديث الأخير' },
    ],
    indexes: [
      { name: 'idx_shipments_tracking_number', fields: ['tracking_number'], isUnique: true, purpose: 'البحث السريع من واجهة التتبع العام' },
      { name: 'idx_shipments_customer_id', fields: ['customer_id'], purpose: 'عروض شحنات العميل في لوحة التحكم' },
      { name: 'idx_shipments_status', fields: ['current_status'], purpose: 'فلترة الشحنات النشطة والمكتملة' },
    ],
    relationships: [
      { targetEntity: 'CUSTOMER', type: 'MANY_TO_ONE', foreignKey: 'customer_id', description: 'صاحب الشحنة' },
      { targetEntity: 'SHIPMENT_EVENT', type: 'ONE_TO_MANY', foreignKey: 'shipment_id', description: 'الأحداث والمراحل الزمنية المحدثة للشحنة' },
    ]
  },

  SHIPMENT_EVENT: {
    tableName: 'shipment_events',
    descriptionAr: 'جدول أحداث ومراحل التايم لاين المحدثة للشحنة (Timeline Logs)',
    descriptionEn: 'Shipment Audit Trail, Milestones & Status Events',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'معرف الحدث' },
      { name: 'shipment_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'shipments.id', isNullable: false, description: 'الشحنة المرتبطة' },
      { name: 'stage', type: "ENUM('BOOKED', 'PICKUP', 'AT_PORT', 'LOADED', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED')", isNullable: false, description: 'مرحلة Milestone' },
      { name: 'status_label_ar', type: 'VARCHAR(191)', isNullable: false, description: 'عنوان الحالة بالعربية' },
      { name: 'status_label_en', type: 'VARCHAR(191)', isNullable: true, description: 'عنوان الحالة بالإنجليزية' },
      { name: 'location', type: 'VARCHAR(255)', isNullable: false, description: 'موقع تسجيل الحدث' },
      { name: 'description_ar', type: 'TEXT', isNullable: false, description: 'وصف تفاصيل الحدث بالعربية' },
      { name: 'description_en', type: 'TEXT', isNullable: true, description: 'وصف تفاصيل الحدث بالإنجليزية' },
      { name: 'visible_to_customer', type: 'BOOLEAN', isNullable: false, description: 'هل يظهر الحدث للعميل في واجهة التتبع' },
      { name: 'created_by', type: 'VARCHAR(36)', isForeignKey: true, references: 'users.id', isNullable: true, description: 'الموظف أو النظام الذي سجل الحدث' },
      { name: 'event_timestamp', type: 'TIMESTAMP', isNullable: false, description: 'التاريخ والوقت الفعلي للحدث' },
    ],
    indexes: [
      { name: 'idx_shipment_events_shipment_id', fields: ['shipment_id', 'event_timestamp'], purpose: 'ترتيب وتشكيل التايم لاين الزمني للشحنة' },
    ],
    relationships: [
      { targetEntity: 'SHIPMENT', type: 'MANY_TO_ONE', foreignKey: 'shipment_id', description: 'الشحنة الأم' },
    ]
  },

  SERVICE: {
    tableName: 'services',
    descriptionAr: 'الخدمات اللوجستية المتاحة بالنظام (شحن بحري، بري، جمارك، تخزين)',
    descriptionEn: 'Logistics Service Catalog',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'معرف الخدمة' },
      { name: 'code', type: 'VARCHAR(64)', isNullable: false, description: 'رمز الخدمة (مثل: SEA_FREIGHT, CUSTOMS_CLEARANCE)' },
      { name: 'title_ar', type: 'VARCHAR(191)', isNullable: false, description: 'اسم الخدمة بالعربية' },
      { name: 'title_en', type: 'VARCHAR(191)', isNullable: false, description: 'اسم الخدمة بالإنجليزية' },
      { name: 'is_active', type: 'BOOLEAN', isNullable: false, description: 'تفعيل أو تعطيل الخدمة' },
    ],
    indexes: [
      { name: 'idx_services_code', fields: ['code'], isUnique: true, purpose: 'الوصول برمز الخدمة' },
    ],
    relationships: [
      { targetEntity: 'QUOTE_REQUEST', type: 'ONE_TO_MANY', foreignKey: 'service_id', description: 'طلبات التسعير التابعة لهذه الخدمة' },
    ]
  },

  LOCATION: {
    tableName: 'locations',
    descriptionAr: 'دليل الموانئ والمطارات والمنافذ والمدن اللوجستية',
    descriptionEn: 'Ports, Terminals, Hubs & Geographic Locations',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'معرف الموقع' },
      { name: 'loc_code', type: 'VARCHAR(32)', isNullable: true, description: 'رمز UN/LOCODE المعتمد (مثل: SAJED, CNNGB)' },
      { name: 'name_ar', type: 'VARCHAR(255)', isNullable: false, description: 'اسم الموقع/الميناء بالعربية' },
      { name: 'name_en', type: 'VARCHAR(255)', isNullable: false, description: 'اسم الموقع/الميناء بالإنجليزية' },
      { name: 'type', type: "ENUM('SEA_PORT', 'AIR_PORT', 'DRY_PORT', 'WAREHOUSE_HUB', 'CITY')", isNullable: false, description: 'نوع المرفق اللوجستي' },
      { name: 'country_code', type: 'VARCHAR(3)', isNullable: false, description: 'رمز الدولة (SA, CN, AE)' },
      { name: 'latitude', type: 'DECIMAL(10,8)', isNullable: true, description: 'خط العرض الجغرافي للخرائط' },
      { name: 'longitude', type: 'DECIMAL(11,8)', isNullable: true, description: 'خط الطول الجغرافي للخرائط' },
    ],
    indexes: [
      { name: 'idx_locations_loc_code', fields: ['loc_code'], isUnique: true, purpose: 'البحث بالرمز الدولي للميناء' },
      { name: 'idx_locations_country', fields: ['country_code', 'type'], purpose: 'فلترة الموانئ حسب الدولة والنوع' },
    ],
    relationships: [
      { targetEntity: 'SHIPMENT', type: 'ONE_TO_MANY', foreignKey: 'origin_location_id', description: 'الشحنات المنطلقة من هذا الميناء' },
    ]
  },

  NOTIFICATION: {
    tableName: 'notifications',
    descriptionAr: 'تنبيهات وإشعارات المستخدمين لتغيرات الشحنات والأسعار',
    descriptionEn: 'User Notifications & Live Event Alerts',
    primaryKey: 'id (UUID / String)',
    fields: [
      { name: 'id', type: 'VARCHAR(36)', isPrimaryKey: true, isNullable: false, description: 'معرف الإشعار' },
      { name: 'recipient_user_id', type: 'VARCHAR(36)', isForeignKey: true, references: 'users.id', isNullable: false, description: 'المستخدم المستلم' },
      { name: 'title_ar', type: 'VARCHAR(255)', isNullable: false, description: 'عنوان الإشعار بالعربية' },
      { name: 'body_ar', type: 'TEXT', isNullable: false, description: 'نص الإشعار بالعربية' },
      { name: 'type', type: "ENUM('SHIPMENT_UPDATE', 'QUOTE_READY', 'SYSTEM_ALERT')", isNullable: false, description: 'تصنيف الإشعار' },
      { name: 'related_entity_type', type: 'VARCHAR(64)', isNullable: true, description: 'نوع الكيان المرتبط (SHIPMENT, QUOTE)' },
      { name: 'related_entity_id', type: 'VARCHAR(36)', isNullable: true, description: 'معرف الكيان المرتبط' },
      { name: 'is_read', type: 'BOOLEAN', isNullable: false, description: 'هل تم الاطلاع على الإشعار' },
      { name: 'created_at', type: 'TIMESTAMP', isNullable: false, description: 'تاريخ وقت الإرسال' },
    ],
    indexes: [
      { name: 'idx_notifications_user_read', fields: ['recipient_user_id', 'is_read', 'created_at'], purpose: 'جلب الإشعارات غير المقروءة بسرعة للمستخدم' },
    ],
    relationships: [
      { targetEntity: 'USER', type: 'MANY_TO_ONE', foreignKey: 'recipient_user_id', description: 'المستلم' },
    ]
  },
};
