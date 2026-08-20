import { ServiceInfo } from '../types/cms';

export interface ServiceProcessStep {
  step: number;
  title: string;
  arabicTitle?: string;
  desc: string;
  arabicDesc?: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  arabicTitle: string;
  description: string;
  arabicDescription: string;
  overview?: string;
  arabicOverview?: string;
  icon: string; // Lucide icon identifier (e.g. 'Plane', 'Ship', 'Truck', 'Warehouse', 'FileCheck', 'Activity')
  badge?: string;
  arabicBadge?: string;
  benefits: string[];
  arabicBenefits: string[];
  process: { step: number; title: string; desc: string }[];
  arabicProcess: { step: number; title: string; desc: string }[];
  industries?: string[];
  arabicIndustries?: string[];
  stats?: { label: string; arabicLabel: string; value: string }[];
  
  // Backward compatibility fields for legacy CMS components & API routes
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  benefitsAr: string[];
  benefitsEn: string[];
  processAr: { step: number; title: string; desc: string }[];
  processEn: { step: number; title: string; desc: string }[];
  featuresAr: string[];
  featuresEn: string[];
  industriesAr?: string[];
  industriesEn?: string[];
  cta?: {
    titleAr?: string;
    titleEn?: string;
    descAr?: string;
    descEn?: string;
    buttonTextAr?: string;
    buttonTextEn?: string;
  };
  faq?: { questionAr: string; questionEn: string; answerAr: string; answerEn: string }[];
  serviceType?: string;
  type?: string;
}

export const SERVICES_DATA: ServiceData[] = [
  {
    id: 'air-freight',
    slug: 'air-freight',
    title: 'AIR FREIGHT',
    arabicTitle: 'الشحن الجوي الفائق (Air Freight)',
    description: 'Fast and reliable air freight solutions for time-sensitive shipments.',
    arabicDescription: 'حلول شحن جوي سريعة وموثوقة للشحنات العاجلة والحسّاسة للوقت مع ضمان التوصيل عبر الخطوط الجوية العالمية.',
    overview: 'AJA International Logistics provides express air cargo chartering, scheduled consolidated flights, temperature-controlled pharma transport, and door-to-door express air delivery across 150+ international airports.',
    arabicOverview: 'تقدم شركة أجا الدولية للخدمات اللوجستية خدمات الشحن الجوي السريع عبر الرحلات المباشرة المجدولة والرحلات المخصصة (Charters)، مع التحكم الكامل بالحرارة للبضائع الطبية والمواد القابلة للتلف، متضمنةً التخليص والتوصيل من الباب إلى الباب.',
    icon: 'Plane',
    badge: 'Express Delivery',
    arabicBadge: 'توصيل جوي سريع',
    stats: [
      { label: 'Transit Time', arabicLabel: 'زمن العبور', value: '24-48 Hours' },
      { label: 'Global Airports', arabicLabel: 'مطارات خادمة', value: '150+' },
      { label: 'On-Time SLA', arabicLabel: 'معدل الالتزام', value: '99.4%' }
    ],
    benefits: [
      'Rapid express transit times for time-critical, high-value cargo',
      'Direct connection with major international airlines and cargo hubs',
      'IATA-certified handling for hazardous goods and temperature-controlled pharma',
      'Complete end-to-end flight telemetry tracking from takeoff to touchdown'
    ],
    arabicBenefits: [
      'سرعة أداء فائقة وزمن عبور قياسي للشحنات الثمينة والعاجلة',
      'ربط مباشر مع الخطوط الجوية العالمية ومراكز الشحن الجوي',
      'معالجة معتمدة من IATA للمواد الخطرة والشحنات الدوائية المبردة',
      'تتبع حي لمسار الطائرة ورحلة الشحنة من الإقلاع وحتى الهبوط'
    ],
    process: [
      { step: 1, title: 'Express Pickup & X-Ray Screening', desc: 'Secure pickup from supplier, airport terminal handover, and X-ray security scanning.' },
      { step: 2, title: 'Air Waybill (AWB) Issuance', desc: 'Customs declaration filing and IATA digital master air waybill generation.' },
      { step: 3, title: 'Flight Transit Telemetry', desc: 'Real-time flight radar tracking and airport transfer monitoring.' },
      { step: 4, title: 'Rapid Customs Release & Door Handover', desc: 'Priority express clearance upon landing and final mile courier delivery.' }
    ],
    arabicProcess: [
      { step: 1, title: 'الاستلام والمسح الأمني', desc: 'استلام الشحنة وتوجيهها للمطار وإجراء الفحص الجمركي والمسح بالأشعة.' },
      { step: 2, title: 'إصدار بوليصة الشحن (AWB)', desc: 'تسجيل البيان الجمركي الجوي وإصدار بوليصة AWB المعتمدة من منظمة IATA.' },
      { step: 3, title: 'الإقلاع والتتبع الراداري', desc: 'متابعة مسار الرحلة الجوية عبر نظام الرادار وحالة العبور بين المطارات.' },
      { step: 4, title: 'الفسح السريع والتسليم', desc: 'إنهاء الفسح الجمركي الفوري بالمطار وتوصيل الشحنة للعميل فور هبوطها.' }
    ],
    industries: ['Pharmaceuticals & Healthcare', 'High-Tech Electronics', 'Aerospace Spare Parts', 'Luxury Goods & E-Commerce'],
    arabicIndustries: ['الأدوية والرعاية الصحية', 'الإلكترونيات والتقنية العالية', 'قطع غيار الطيران والسيارات', 'البضائع الثمينة والتجارة الإلكترونية'],

    // Legacy fields mapping
    titleAr: 'الشحن الجوي الفائق (Air Freight)',
    titleEn: 'AIR FREIGHT',
    descriptionAr: 'حلول شحن جوي سريعة وموثوقة للشحنات العاجلة والحسّاسة للوقت مع ضمان التوصيل عبر الخطوط الجوية العالمية.',
    descriptionEn: 'Fast and reliable air freight solutions for time-sensitive shipments.',
    iconName: 'Plane',
    featuresAr: ['رحلات مجدولة ورحلات خاصة Charters', 'تتبع حي عبر الرادار والجداول الجوية', 'خدمة الباب إلى الباب المباشرة (Door-to-Door)'],
    featuresEn: ['Scheduled flights & full freighter charter options', 'Live flight radar tracking & AWB status alerts', 'Direct Door-to-Door priority delivery'],
    benefitsAr: [
      'سرعة أداء فائقة وزمن عبور قياسي للشحنات الثمينة والعاجلة',
      'ربط مباشر مع الخطوط الجوية العالمية ومراكز الشحن الجوي',
      'معالجة معتمدة من IATA للمواد الخطرة والشحنات الدوائية المبردة',
      'تتبع حي لمسار الطائرة ورحلة الشحنة من الإقلاع وحتى الهبوط'
    ],
    benefitsEn: [
      'Rapid express transit times for time-critical, high-value cargo',
      'Direct connection with major international airlines and cargo hubs',
      'IATA-certified handling for hazardous goods and temperature-controlled pharma',
      'Complete end-to-end flight telemetry tracking from takeoff to touchdown'
    ],
    processAr: [
      { step: 1, title: 'الاستلام والمسح الأمني', desc: 'استلام الشحنة وتوجيهها للمطار وإجراء الفحص الجمركي والمسح بالأشعة.' },
      { step: 2, title: 'إصدار بوليصة الشحن (AWB)', desc: 'تسجيل البيان الجمركي الجوي وإصدار بوليصة AWB المعتمدة من منظمة IATA.' },
      { step: 3, title: 'الإقلاع والتتبع الراداري', desc: 'متابعة مسار الرحلة الجوية عبر نظام الرادار وحالة العبور بين المطارات.' },
      { step: 4, title: 'الفسح السريع والتسليم', desc: 'إنهاء الفسح الجمركي الفوري بالمطار وتوصيل الشحنة للعميل فور هبوطها.' }
    ],
    processEn: [
      { step: 1, title: 'Express Pickup & X-Ray Screening', desc: 'Secure pickup from supplier, airport terminal handover, and X-ray security scanning.' },
      { step: 2, title: 'Air Waybill (AWB) Issuance', desc: 'Customs declaration filing and IATA digital master air waybill generation.' },
      { step: 3, title: 'Flight Transit Telemetry', desc: 'Real-time flight radar tracking and airport transfer monitoring.' },
      { step: 4, title: 'Rapid Customs Release & Door Handover', desc: 'Priority express clearance upon landing and final mile courier delivery.' }
    ],
    industriesAr: ['الأدوية والرعاية الصحية', 'الإلكترونيات والتقنية العالية', 'قطع غيار الطيران والسيارات', 'البضائع الثمينة والتجارة الإلكترونية'],
    industriesEn: ['Pharmaceuticals & Healthcare', 'High-Tech Electronics', 'Aerospace Spare Parts', 'Luxury Goods & E-Commerce'],
    cta: {
      titleAr: 'هل لديك شحنة عاجلة تتطلب الشحن الجوي؟',
      titleEn: 'Have Time-Sensitive Cargo Needing Air Freight?',
      descAr: 'تواصل مع فريق الشحن الجوي لإصدار التكلفة المباشرة وحجز أقرب رحلة طيران.',
      descEn: 'Contact our air charter specialists for instant quotes and guaranteed flight space.',
      buttonTextAr: 'طلب عرض سعر شحن جوي',
      buttonTextEn: 'Request Air Freight Quote'
    }
  },
  {
    id: 'sea-freight',
    slug: 'sea-freight',
    title: 'SEA FREIGHT',
    arabicTitle: 'الشحن البحري الدولي (Sea Freight)',
    description: 'Efficient global ocean freight solutions for large-scale cargo.',
    arabicDescription: 'حلول شحن بحري عالمية كفؤة واقتصادية للحمولات والشحنات الضخمة مع تغطية كاملة لكافة الموانئ.',
    overview: 'AJA Sea Freight delivers full container load (FCL), consolidated container load (LCL), breakbulk, and project cargo services across all key maritime routes connecting Asia, Europe, the Americas, and Middle Eastern hub ports.',
    arabicOverview: 'تقدم أجا للخدمات اللوجستية خدمات الشحن البحري للحرائر الكبيرة بالحاويات الكاملة (FCL)، الشحنات المجمعة (LCL)، والمعدات الثقيلة عبر الموانئ العالمية بالبحر الأحمر والخليج العربي مع ربط مباشر مع خطوط الملاحة البحرية العالمية.',
    icon: 'Ship',
    badge: 'Global Ocean Lanes',
    arabicBadge: 'المسارات البحرية العالمية',
    stats: [
      { label: 'Container Types', arabicLabel: 'أنواع الحاويات', value: 'FCL / LCL / Reefer' },
      { label: 'Global Ports', arabicLabel: 'الموانئ المخدومة', value: '350+' },
      { label: 'Cost Savings', arabicLabel: 'توفير التكاليف', value: 'Up to 40%' }
    ],
    benefits: [
      'Cost-effective ocean transit for heavy bulk cargo and high volume containers',
      'Comprehensive marine cargo insurance against all transit and maritime risks',
      'Regular weekly sailing schedules with verified departure and arrival windows',
      'Direct Saudi Ports Authority (MAWANI) berth reservation & EDI integration'
    ],
    arabicBenefits: [
      'تكلفة شحن اقتصادية ومثالية للشحنات الثمينة والحجوم الضخمة',
      'تأمين بحري شامل يغطي كافة مخاطر الشحن وظروف الإبحار',
      'جدولة إبحار أسبوعية منتظمة مع ضمان أوقات الوصول بالموانئ',
      'ربط مباشر مع الهيئة العامة للموانئ (موانئ) ونظام التبادل الإلكتروني'
    ],
    process: [
      { step: 1, title: 'Container Selection & Space Booking', desc: 'Selecting container specs (20ft/40ft/Reefer) and securing ocean vessel space.' },
      { step: 2, title: 'Port Loading & Bill of Lading', desc: 'Cargo receipt, weight verification, certificate checks, and BL issuance.' },
      { step: 3, title: 'Ocean Transit Telemetry', desc: 'Satellite vessel tracking and live progress updates during maritime transport.' },
      { step: 4, title: 'Customs FASAH Clearance & Unloading', desc: 'Instant Saudi FASAH customs clearance and final port haulage delivery.' }
    ],
    arabicProcess: [
      { step: 1, title: 'حجز الحاوية والمساحة', desc: 'تحديد نوع الحاوية (20ft / 40ft / Reefer) وحجز المساحة على السفينة.' },
      { step: 2, title: 'الاستلام والتحميل بالميناء', desc: 'نقل البضائع ومراجعة الأوزان وشهادات المنشأ وإصدار بوليصة الشحن البحرية.' },
      { step: 3, title: 'الإبحار والتتبع المباشر', desc: 'متابعة حركة السفينة عبر الأقمار الصناعية وتحديث موقع الشحنة.' },
      { step: 4, title: 'الوصول والفسح الجمركي', desc: 'إنهاء الفسح الجمركي الفوري عبر منصة فسح وتسليم الحاوية بالمستودع.' }
    ],
    industries: ['Heavy Industrial & Energy', 'Automotive & Machinery', 'Retail & FMCG', 'Construction & Building Materials'],
    arabicIndustries: ['الصناعات الثقيلة والطاقة', 'السيارات والمعدات', 'التجزئة والسلع الاستهلاكية', 'البناء والتشييد'],

    // Legacy fields mapping
    titleAr: 'الشحن البحري الدولي (Sea Freight)',
    titleEn: 'SEA FREIGHT',
    descriptionAr: 'حلول شحن بحري عالمية كفؤة واقتصادية للحمولات والشحنات الضخمة مع تغطية كاملة لكافة الموانئ.',
    descriptionEn: 'Efficient global ocean freight solutions for large-scale cargo.',
    iconName: 'Ship',
    featuresAr: ['حاويات كاملة FCL وحاويات مشتركة LCL', 'تغطية شاملة لموانئ البحر الأحمر والخليج العربي والموانئ العالمية', 'ربط مباشر مع الملاحة البحرية ونظام الموانئ'],
    featuresEn: ['FCL & LCL Container Solutions', 'Global port coverage across Red Sea, Arabian Gulf & Worldwide', 'Direct carrier integrations and port EDI systems'],
    benefitsAr: [
      'تكلفة شحن اقتصادية ومثالية للشحنات الثمينة والحجوم الضخمة',
      'تأمين بحري شامل يغطي كافة مخاطر الشحن وظروف الإبحار',
      'جدولة إبحار أسبوعية منتظمة مع ضمان أوقات الوصول بالموانئ',
      'ربط مباشر مع الهيئة العامة للموانئ (موانئ) ونظام التبادل الإلكتروني'
    ],
    benefitsEn: [
      'Cost-effective ocean transit for heavy bulk cargo and high volume containers',
      'Comprehensive marine cargo insurance against all transit and maritime risks',
      'Regular weekly sailing schedules with verified departure and arrival windows',
      'Direct Saudi Ports Authority (MAWANI) berth reservation & EDI integration'
    ],
    processAr: [
      { step: 1, title: 'حجز الحاوية والمساحة', desc: 'تحديد نوع الحاوية (20ft / 40ft / Reefer) وحجز المساحة على السفينة.' },
      { step: 2, title: 'الاستلام والتحميل بالميناء', desc: 'نقل البضائع ومراجعة الأوزان وشهادات المنشأ وإصدار بوليصة الشحن البحرية.' },
      { step: 3, title: 'الإبحار والتتبع المباشر', desc: 'متابعة حركة السفينة عبر الأقمار الصناعية وتحديث موقع الشحنة.' },
      { step: 4, title: 'الوصول والفسح الجمركي', desc: 'إنهاء الفسح الجمركي الفوري عبر منصة فسح وتسليم الحاوية بالمستودع.' }
    ],
    processEn: [
      { step: 1, title: 'Container Selection & Space Booking', desc: 'Selecting container specs (20ft/40ft/Reefer) and securing ocean vessel space.' },
      { step: 2, title: 'Port Loading & Bill of Lading', desc: 'Cargo receipt, weight verification, certificate checks, and BL issuance.' },
      { step: 3, title: 'Ocean Transit Telemetry', desc: 'Satellite vessel tracking and live progress updates during maritime transport.' },
      { step: 4, title: 'Customs FASAH Clearance & Unloading', desc: 'Instant Saudi FASAH customs clearance and final port haulage delivery.' }
    ],
    industriesAr: ['الصناعات الثقيلة والطاقة', 'السيارات والمعدات', 'التجزئة والسلع الاستهلاكية', 'البناء والتشييد'],
    industriesEn: ['Heavy Industrial & Energy', 'Automotive & Machinery', 'Retail & FMCG', 'Construction & Building Materials'],
    cta: {
      titleAr: 'هل تحتاج إلى شحن حاويات عبر البحار؟',
      titleEn: 'Need Sea Container Freight Quotes?',
      descAr: 'احصل على تسعيرة تنافسية مجاناً خلال دقائق مع جدولة رحلات دقيقة.',
      descEn: 'Get competitive rates instantly with full sailing schedule visibility.',
      buttonTextAr: 'طلب عرض سعر شحن بحري',
      buttonTextEn: 'Request Sea Freight Quote'
    }
  },
  {
    id: 'land-transport',
    slug: 'land-transport',
    title: 'LAND TRANSPORT',
    arabicTitle: 'النقل البري والأسطول الذكي (Land Transport)',
    description: 'Reliable road transportation connecting regional and international destinations.',
    arabicDescription: 'خدمات نقل بري موثوقة تربط بين المدن المحلية والوجهات الإقليمية والدولية بأسطول ذكي مجهز.',
    overview: 'AJA Land Transport maintains a fleet of 250+ heavy trucks, flatbeds, curtain-siders, and climate-controlled reefer trailers connecting all Saudi Arabian provinces, GCC cross-border routes, and Middle Eastern trade gateways.',
    arabicOverview: 'يمتلك أساطيل أجا للنقل البري أكثر من 250 شاحنة ومقطورة متطورة، تشمل الشاحنات المبردة، الحاويات المسطحة، والمواد الخطرة لنقل البضائع عبر مدن المملكة وكافة الدول المجاورة بالخليج العربي والشرق الأوسط.',
    icon: 'Truck',
    badge: 'KSA & GCC Overland',
    arabicBadge: 'أسطول المملكة والخليج',
    stats: [
      { label: 'Active Fleet', arabicLabel: 'حجم الأسطول', value: '250+ Trucks' },
      { label: 'GCC Destinations', arabicLabel: 'وجهات الخليج', value: '100% Covered' },
      { label: 'Delivery Accuracy', arabicLabel: 'دقة التوصيل', value: '98.8%' }
    ],
    benefits: [
      'Direct Door-to-Door road delivery eliminating intermediate cargo offloading',
      'Certified drivers trained in hazardous materials (ADR) and heavy haulage',
      'Real-time GPS telemetry tracking vehicle speed, fuel, and internal cargo temperature',
      'Optimized route dispatching providing accurate arrival time windows'
    ],
    arabicBenefits: [
      'توصيل بري مباشر من الباب إلى الباب بدون حاجة لتفريغ وسيط',
      'سائقون محترفون ومعتمدون لنقل المواد الخطرة والحمولات الثقيلة',
      'متابعة لحظية بنظام GPS لموقع الشاحنة وحالة درجة الحرارة',
      'جدولة مسارات ذكية تضمن الوصول بالموعد المحدد بدقة'
    ],
    process: [
      { step: 1, title: 'Trailer Assignment & Dispatch', desc: 'Selecting trailer type (Flatbed, Curtain-side, Reefer) and dispatching pickup.' },
      { step: 2, title: 'Cargo Inspection & Waybill Issue', desc: 'Cargo safety lashing and electronic waybill manifest creation.' },
      { step: 3, title: 'Highway GPS Telemetry', desc: 'Live control room monitoring of transit speed and route checkpoints.' },
      { step: 4, title: 'Offloading & Digital e-POD Signature', desc: 'Safe destination unloading and instant e-signature confirmation.' }
    ],
    arabicProcess: [
      { step: 1, title: 'تجهيز الشاحنة والتحميل', desc: 'اختيار نوع المقطورة المناسبة وتحديد موعد الاستلام من المنشأة.' },
      { step: 2, title: 'الفحص وإصدار الوثيقة', desc: 'تثبيت البضائع وتأمينها وإصدار وثيقة النقل الإلكترونية.' },
      { step: 3, title: 'الانطلاق والمتابعة الحيّة', desc: 'متابعة خط سير الشاحنة عبر غرفة العمليات المركزية.' },
      { step: 4, title: 'التفريغ والتوقيع الإلكتروني', desc: 'تفريغ الشحنة في موقع العميل والحصول على إثبات التسليم (POD).' }
    ],
    industries: ['FMCG & Grocery Distribution', 'Industrial Machinery', 'Cold Chain Agriculture & Food', 'Petrochemicals & Mining'],
    arabicIndustries: ['التجزئة والمنتجات الاستهلاكية', 'المعدات الصناعية', 'الأغذية والمأكولات المبردة', 'البتروكيماويات والتعدين'],

    // Legacy fields mapping
    titleAr: 'النقل البري والأسطول الذكي (Land Transport)',
    titleEn: 'LAND TRANSPORT',
    descriptionAr: 'خدمات نقل بري موثوقة تربط بين المدن المحلية والوجهات الإقليمية والدولية بأسطول ذكي مجهز.',
    descriptionEn: 'Reliable road transportation connecting regional and international destinations.',
    iconName: 'Truck',
    featuresAr: ['أسطول يتجاوز 250 شاحنة ومقطورة متعددة الأحجام', 'أنظمة تتبع حي وتتبع درجات الحرارة للمبرد', 'تغطية برية كاملة بين مدن المملكة وبين دول الخليج'],
    featuresEn: ['Fleet of 250+ heavy trucks and trailers', 'Real-time GPS telemetry and reefer cold chain sensors', 'Cross-border GCC transport and internal Saudi kingdom coverage'],
    benefitsAr: [
      'توصيل بري مباشر من الباب إلى الباب بدون حاجة لتفريغ وسيط',
      'سائقون محترفون ومعتمدون لنقل المواد الخطرة والحمولات الثقيلة',
      'متابعة لحظية بنظام GPS لموقع الشاحنة وحالة درجة الحرارة',
      'جدولة مسارات ذكية تضمن الوصول بالموعد المحدد بدقة'
    ],
    benefitsEn: [
      'Direct Door-to-Door road delivery eliminating intermediate cargo offloading',
      'Certified drivers trained in hazardous materials (ADR) and heavy haulage',
      'Real-time GPS telemetry tracking vehicle speed, fuel, and internal cargo temperature',
      'Optimized route dispatching providing accurate arrival time windows'
    ],
    processAr: [
      { step: 1, title: 'تجهيز الشاحنة والتحميل', desc: 'اختيار نوع المقطورة المناسبة وتحديد موعد الاستلام من المنشأة.' },
      { step: 2, title: 'الفحص وإصدار الوثيقة', desc: 'تثبيت البضائع وتأمينها وإصدار وثيقة النقل الإلكترونية.' },
      { step: 3, title: 'الانطلاق والمتابعة الحيّة', desc: 'متابعة خط سير الشاحنة عبر غرفة العمليات المركزية.' },
      { step: 4, title: 'التفريغ والتوقيع الإلكتروني', desc: 'تفريغ الشحنة في موقع العميل والحصول على إثبات التسليم (POD).' }
    ],
    processEn: [
      { step: 1, title: 'Trailer Assignment & Dispatch', desc: 'Selecting trailer type (Flatbed, Curtain-side, Reefer) and dispatching pickup.' },
      { step: 2, title: 'Cargo Inspection & Waybill Issue', desc: 'Cargo safety lashing and electronic waybill manifest creation.' },
      { step: 3, title: 'Highway GPS Telemetry', desc: 'Live control room monitoring of transit speed and route checkpoints.' },
      { step: 4, title: 'Offloading & Digital e-POD Signature', desc: 'Safe destination unloading and instant e-signature confirmation.' }
    ],
    industriesAr: ['التجزئة والمنتجات الاستهلاكية', 'المعدات الصناعية', 'الأغذية والمأكولات المبردة', 'البتروكيماويات والتعدين'],
    industriesEn: ['FMCG & Grocery Distribution', 'Industrial Machinery', 'Cold Chain Agriculture & Food', 'Petrochemicals & Mining'],
    cta: {
      titleAr: 'هل تريد نقل شحناتك البرية بأعلى معايير الأمان؟',
      titleEn: 'Need Overland Fleet Logistics?',
      descAr: 'نضمن لك أسرع زمني توصيل بري داخل المملكة ودول الخليج.',
      descEn: 'Guaranteed route efficiency across Saudi Arabia and the GCC region.',
      buttonTextAr: 'طلب عرض سعر نقل بري',
      buttonTextEn: 'Request Land Transport Quote'
    }
  },
  {
    id: 'warehousing',
    slug: 'warehousing',
    title: 'WAREHOUSING',
    arabicTitle: 'التخزين والمستودعات الذكية (Warehousing)',
    description: 'Flexible and secure warehousing solutions for modern supply chains.',
    arabicDescription: 'حلول تخزين مرنة وآمنة للمستودعات الحديثة وسلاسل الإمداد مع ربط أنظمة WMS.',
    overview: 'AJA operates modern, strategic, climate-controlled bonded warehouses in Riyadh, Jeddah, and Dammam equipped with automated rack systems, RFID inventory scanning, and 24/7 security monitoring.',
    arabicOverview: 'تدير أجا مستودعات نموذجية مرخصة ومكيفة في أهم المراكز اللوجستية بالرياض، جدة، والدمام، مصممة للتخزين الجاف والمبرد وإدارة المخزون عبر أحدث البرمجيات لقطاعات التجارة الإلكترونية والتجزئة.',
    icon: 'Warehouse',
    badge: 'Smart WMS Hubs',
    arabicBadge: 'مستودعات نموذجية ذكية',
    stats: [
      { label: 'Storage Accuracy', arabicLabel: 'دقة المخزون', value: '99.8%' },
      { label: 'Climate Options', arabicLabel: 'خيارات التبريد', value: 'Ambient, Chilled, Frozen' },
      { label: 'Hub Locations', arabicLabel: 'المراكز الرئيسية', value: 'Riyadh, Jeddah, Dammam' }
    ],
    benefits: [
      '99.8% inventory accuracy powered by real-time barcode & RFID scanning',
      'Strict temperature & humidity control for ambient, chilled, and frozen goods',
      'Scalable short and long-term space rentals with flexible contract terms',
      'Professional Pick & Pack, kitting, labeling, and e-commerce fulfillment'
    ],
    arabicBenefits: [
      'دقة جرد فائقة تصل إلى 99.8% باستخدام تقنيات الباركود و RFID',
      'تحكم بيئي كامل بدرجات الحرارة والرطوبة للتخزين المبرد والجاف',
      'مرونة متكاملة في حجز المساحات لفترات قصيرة أو طويلة الأمد',
      'خدمات التجهيز والتغليف الاحترافية وتلبية طلبات المتاجر الإلكترونية'
    ],
    process: [
      { step: 1, title: 'Inbound SKU Inspection', desc: 'Receiving goods, verifying barcodes, and entering quantities into WMS.' },
      { step: 2, title: 'Automated Rack Allocation', desc: 'Assigning pallet rack placement and updating client stock portal.' },
      { step: 3, title: 'Order Pick & Pack', desc: 'Retrieving items upon order placement, custom packaging, and labeling.' },
      { step: 4, title: 'Outbound Dispatch & Reconciliation', desc: 'Loading delivery trucks, adjusting inventory levels, and dispatch alerts.' }
    ],
    arabicProcess: [
      { step: 1, title: 'الاستلام والترميز', desc: 'فحص البضائع الواردة ومطابقة الأصناف وإدخالها بالنظام.' },
      { step: 2, title: 'التخزين بالرفوف الذكية', desc: 'تخصيص الرف والمكان الدقيق برقم الطبلية وتحديث الرصيد.' },
      { step: 3, title: 'التجميع والتغليف', desc: 'استلام أمر الصرف، سحب البضاعة، وتغليفها برمز الشحن.' },
      { step: 4, title: 'التجميع للشحن الخارجي', desc: 'تحميل الشاحنات وتحديث رصيد المخزون في بوابة العميل.' }
    ],
    industries: ['E-Commerce & Retail', 'Pharmaceuticals & Medical Devices', 'Electronics & Consumer Goods', 'Food & Beverage'],
    arabicIndustries: ['التجارة الإلكترونية والتجزئة', 'الأدوية والمستلزمات الطبية', 'الإلكترونيات والمنتجات الاستهلاكية', 'الأغذية والمشروبات'],

    // Legacy fields mapping
    titleAr: 'التخزين والمستودعات الذكية (Warehousing)',
    titleEn: 'WAREHOUSING',
    descriptionAr: 'حلول تخزين مرنة وآمنة للمستودعات الحديثة وسلاسل الإمداد مع ربط أنظمة WMS.',
    descriptionEn: 'Flexible and secure warehousing solutions for modern supply chains.',
    iconName: 'Warehouse',
    featuresAr: ['مستودعات مجهزة بأعلى معايير السلامة والأمن وشروط بلدي', 'ربط البرمجيات لنظام إدارة المستودعات WMS مع متجرك الإلكتروني', 'مرونة في المساحات (تخزين بالمتر، بالطبلية، أو مستودع خاص)'],
    featuresEn: ['Saudi Balady certified facilities with 24/7 CCTV security', 'WMS integration with ERPs and E-commerce platforms', 'Flexible spaces: per pallet, per sqm, or dedicated private zones'],
    benefitsAr: [
      'دقة جرد فائقة تصل إلى 99.8% باستخدام تقنيات الباركود و RFID',
      'تحكم بيئي كامل بدرجات الحرارة والرطوبة للتخزين المبرد والجاف',
      'مرونة متكاملة في حجز المساحات لفترات قصيرة أو طويلة الأمد',
      'خدمات التجهيز والتغليف الاحترافية وتلبية طلبات المتاجر الإلكترونية'
    ],
    benefitsEn: [
      '99.8% inventory accuracy powered by real-time barcode & RFID scanning',
      'Strict temperature & humidity control for ambient, chilled, and frozen goods',
      'Scalable short and long-term space rentals with flexible contract terms',
      'Professional Pick & Pack, kitting, labeling, and e-commerce fulfillment'
    ],
    processAr: [
      { step: 1, title: 'الاستلام والترميز', desc: 'فحص البضائع الواردة ومطابقة الأصناف وإدخالها بالنظام.' },
      { step: 2, title: 'التخزين بالرفوف الذكية', desc: 'تخصيص الرف والمكان الدقيق برقم الطبلية وتحديث الرصيد.' },
      { step: 3, title: 'التجميع والتغليف', desc: 'استلام أمر الصرف، سحب البضاعة، وتغليفها برمز الشحن.' },
      { step: 4, title: 'التجميع للشحن الخارجي', desc: 'تحميل الشاحنات وتحديث رصيد المخزون في بوابة العميل.' }
    ],
    processEn: [
      { step: 1, title: 'Inbound SKU Inspection', desc: 'Receiving goods, verifying barcodes, and entering quantities into WMS.' },
      { step: 2, title: 'Automated Rack Allocation', desc: 'Assigning pallet rack placement and updating client stock portal.' },
      { step: 3, title: 'Order Pick & Pack', desc: 'Retrieving items upon order placement, custom packaging, and labeling.' },
      { step: 4, title: 'Outbound Dispatch & Reconciliation', desc: 'Loading delivery trucks, adjusting inventory levels, and dispatch alerts.' }
    ],
    industriesAr: ['التجارة الإلكترونية والتجزئة', 'الأدوية والمستلزمات الطبية', 'الإلكترونيات والمنتجات الاستهلاكية', 'الأغذية والمشروبات'],
    industriesEn: ['E-Commerce & Retail', 'Pharmaceuticals & Medical Devices', 'Electronics & Consumer Goods', 'Food & Beverage'],
    cta: {
      titleAr: 'هل تبحث عن مساحات تخزين آمنة لمخزونك؟',
      titleEn: 'Need Warehouse Storage Solutions?',
      descAr: 'نوفر لك حلول تخزين مرنة في الرياض وجدة والدمام.',
      descEn: 'Flexible warehousing options available in key Kingdom hubs.',
      buttonTextAr: 'حجز مساحة تخزين',
      buttonTextEn: 'Reserve Storage Space'
    }
  },
  {
    id: 'customs',
    slug: 'customs',
    title: 'CUSTOMS CLEARANCE',
    arabicTitle: 'التخليص الجمركي المعتمد (Customs Clearance)',
    description: 'Professional customs clearance designed to simplify international trade.',
    arabicDescription: 'خدمات تخليص جمركي احترافية صُممت لتبسيط عمليات التجارة الدولية وتسريع الإجراءات.',
    overview: 'AJA Customs Clearance simplifies complex international trade regulations through direct integration with Saudi ZATCA and the FASAH electronic customs portal, supported by licensed in-house customs brokers.',
    arabicOverview: 'تختصر أجا للخدمات اللوجستية الإجراءات الجمركية المعقدة عبر ربط إلكتروني مباشر مع منصة "فسح" وهيئة الزكاة والضريبة والجمارك، لإنهاء التخليص في الموانئ الجوية والبحرية والبرية بسرعة قياسية.',
    icon: 'FileCheck',
    badge: 'Saudi FASAH Certified',
    arabicBadge: 'معتمد لدى منصة فسح',
    stats: [
      { label: 'Release Time', arabicLabel: 'زمن الفسح', value: '< 24 Hours' },
      { label: 'Licensed Brokers', arabicLabel: 'مخلصون معتمدون', value: 'In-House Team' },
      { label: 'Customs Gateways', arabicLabel: 'المنافذ الجمركية', value: 'All Saudi Borders' }
    ],
    benefits: [
      'Rapid customs clearance completed within 24 hours for compliant documentation',
      'In-house certified customs brokers ensuring precise HS Code classification',
      'Elimination of container demurrage and port storage penalties',
      'Transparent automated ZATCA digital fee calculations and receipt billing'
    ],
    arabicBenefits: [
      'إنهاء التخليص الجمركي خلال أقل من 24 ساعة للشحنات المكتملة المستندات',
      'مخلصون جمركيون معتمدون لضمان الترميز الجمركي الدقيق لتفادي الغرامات',
      'تجنب غرامات تأخير الحاويات ورسوم أرضيات الموانئ',
      'أتمتة الفواتير والرسوم الجمركية وفق ضوابط هيئة الزكاة والضريبة'
    ],
    process: [
      { step: 1, title: 'Document Audit & HS Classification', desc: 'Auditing invoices, certificates of origin, and assigning correct HS codes.' },
      { step: 2, title: 'FASAH Declaration Submission', desc: 'Filing electronic customs manifest into the FASAH Saudi gateway.' },
      { step: 3, title: 'Customs Duty Settlement', desc: 'Processing valuation duty payments and managing inspection appointments.' },
      { step: 4, title: 'Release Gate Pass & Port Pick', desc: 'Securing clearance release permit and dispatching trucks for pickup.' }
    ],
    arabicProcess: [
      { step: 1, title: 'مراجعة المستندات والتصنيف', desc: 'تدقيق الفواتير وشهادات المنشأ وتحديد الرمز الجمركي المناسب.' },
      { step: 2, title: 'التقديم عبر منصة فسح', desc: 'رفع بوليصة الشحن والمستندات إلكترونياً على نظام فسح.' },
      { step: 3, title: 'السداد والمعاينة', desc: 'متابعة التثمين الجمركي وسداد الرسوم وإتمام المعاينة.' },
      { step: 4, title: 'إذن الفسح والخروج', desc: 'إصدار تصريح الخروج وتوجيه الشاحنات لنقل الحاوية من الميناء.' }
    ],
    industries: ['Global Importers & Exporters', 'Manufacturing & Raw Materials', 'Healthcare & Medical Equipment', 'Consumer Goods'],
    arabicIndustries: ['المستوردون والمصدرون', 'المصانع والمواد الخام', 'المعدات الطبية والرعاية', 'البضائع الاستهلاكية'],

    // Legacy fields mapping
    titleAr: 'التخليص الجمركي المعتمد (Customs Clearance)',
    titleEn: 'CUSTOMS CLEARANCE',
    descriptionAr: 'خدمات تخليص جمركي احترافية صُممت لتبسيط عمليات التجارة الدولية وتسريع الإجراءات.',
    descriptionEn: 'Professional customs clearance designed to simplify international trade.',
    iconName: 'FileCheck',
    featuresAr: ['ربط إلكتروني مباشر مع نظام فسح وهيئة الزكاة والضريبة والجمرك', 'تتبع حركة الحاوية من الرصيف البحري وحتى الساحات والتفريغ', 'إدارة أذونات التسليم وبوالص التأمين الإلكترونية'],
    featuresEn: ['Direct API integration with Saudi FASAH & ZATCA customs', 'Container lifecycle tracking from berth to yard offloading', 'Automated delivery order (DO) processing and demurrage mitigation'],
    benefitsAr: [
      'إنهاء التخليص الجمركي خلال أقل من 24 ساعة للشحنات المكتملة المستندات',
      'مخلصون جمركيون معتمدون لضمان الترميز الجمركي الدقيق لتفادي الغرامات',
      'تجنب غرامات تأخير الحاويات ورسوم أرضيات الموانئ',
      'أتمتة الفواتير والرسوم الجمركية وفق ضوابط هيئة الزكاة والضريبة'
    ],
    benefitsEn: [
      'Rapid customs clearance completed within 24 hours for compliant documentation',
      'In-house certified customs brokers ensuring precise HS Code classification',
      'Elimination of container demurrage and port storage penalties',
      'Transparent automated ZATCA digital fee calculations and receipt billing'
    ],
    processAr: [
      { step: 1, title: 'مراجعة المستندات والتصنيف', desc: 'تدقيق الفواتير وشهادات المنشأ وتحديد الرمز الجمركي المناسب.' },
      { step: 2, title: 'التقديم عبر منصة فسح', desc: 'رفع بوليصة الشحن والمستندات إلكترونياً على نظام فسح.' },
      { step: 3, title: 'السداد والمعاينة', desc: 'متابعة التثمين الجمركي وسداد الرسوم وإتمام المعاينة.' },
      { step: 4, title: 'إذن الفسح والخروج', desc: 'إصدار تصريح الخروج وتوجيه الشاحنات لنقل الحاوية من الميناء.' }
    ],
    processEn: [
      { step: 1, title: 'Document Audit & HS Classification', desc: 'Auditing invoices, certificates of origin, and assigning correct HS codes.' },
      { step: 2, title: 'FASAH Declaration Submission', desc: 'Filing electronic customs manifest into the FASAH Saudi gateway.' },
      { step: 3, title: 'Customs Duty Settlement', desc: 'Processing valuation duty payments and managing inspection appointments.' },
      { step: 4, title: 'Release Gate Pass & Port Pick', desc: 'Securing clearance release permit and dispatching trucks for pickup.' }
    ],
    industriesAr: ['المستوردون والمصدرون', 'المصانع والمواد الخام', 'المعدات الطبية والرعاية', 'البضائع الاستهلاكية'],
    industriesEn: ['Global Importers & Exporters', 'Manufacturing & Raw Materials', 'Healthcare & Medical Equipment', 'Consumer Goods'],
    cta: {
      titleAr: 'هل تبحث عن فسح جمركي سريع بدون تأخير؟',
      titleEn: 'Looking for Fast FASAH Customs Clearance?',
      descAr: 'خبراؤنا يضمنون إنهاء إجراءاتك بسرعة وكفاءة.',
      descEn: 'Our licensed brokers handle all Saudi customs workflows smoothly.',
      buttonTextAr: 'طلب خدمة فسح جمركي',
      buttonTextEn: 'Request Customs Clearance'
    }
  },
  {
    id: 'supply-chain-solutions',
    slug: 'supply-chain-solutions',
    title: 'SUPPLY CHAIN SOLUTIONS',
    arabicTitle: 'حلول سلاسل الإمداد المتكاملة (Supply Chain Solutions)',
    description: 'Integrated logistics solutions designed around your business.',
    arabicDescription: 'حلول لوجستية متكاملة صُممت حول متطلبات عملك لتعزيز المرونة والشفافية وتوفير التكاليف.',
    overview: 'AJA Supply Chain Solutions connects sea, air, land, customs, and warehousing into a single, cohesive 4PL Control Tower framework tailored specifically to your enterprise operations.',
    arabicOverview: 'تقدم أجا منظومة كاملة لإدارة سلاسل الإمداد 4PL، تجمع بين التخطيط الاستراتيجي، الشفافية اللحظية عبر البرمجيات، وإدارة الموردين والأسطول لتقليل الهدر المالي وتحسين الكفاءة.',
    icon: 'Activity',
    badge: '4PL Control Tower',
    arabicBadge: 'برج مراقبة سلاسل الإمداد 4PL',
    stats: [
      { label: 'Visibility level', arabicLabel: 'مستوى الشفافية', value: '100% Real-Time' },
      { label: 'Logistics Optimization', arabicLabel: 'تحسين الكفاءة', value: 'Up to 25% Savings' },
      { label: 'ERP Integration', arabicLabel: 'الربط التقني', value: 'SAP, Oracle, Odoo' }
    ],
    benefits: [
      'Tailored end-to-end 4PL architecture customized for your business KPIs',
      'Centralized Control Tower dashboard monitoring all regional cargo movements',
      'Predictive AI ETA algorithms detecting route bottlenecks before delays occur',
      'Unified enterprise billing, vendor management, and carbon emissions auditing'
    ],
    arabicBenefits: [
      'هيكلية لوجستية 4PL مخصصة بالكامل لتتناسب مع أهداف منشأتك',
      'لوحة قيادة مركزية (Control Tower) تتبع كافة الشحنات والمستودعات',
      'خوارزميات تنبؤية بالذكاء الاصطناعي لاكتشاف التأخيرات مبكراً',
      'فواتير موحدة وإدارة شاملة للموردين مع تقارير كفاءة الأداء'
    ],
    process: [
      { step: 1, title: 'Supply Chain Audit', desc: 'Analyzing current freight bottlenecks, carrier costs, and lead times.' },
      { step: 2, title: 'Control Tower Integration', desc: 'Connecting corporate ERP via secure APIs to our central logistics portal.' },
      { step: 3, title: 'Execution & Live Telemetry', desc: 'Orchestrating multi-modal transport and warehouse operations seamlessly.' },
      { step: 4, title: 'Analytics & Continuous Optimization', desc: 'Reviewing quarterly KPI performance metrics to drive down supply chain spend.' }
    ],
    arabicProcess: [
      { step: 1, title: 'تحليل سلسلة الإمداد', desc: 'تقييم المسارات الحالية وتكاليف الشحن ومعدلات التأخير.' },
      { step: 2, title: 'الربط البرمجي المركزي', desc: 'ربط أنظمة الشركة ERP مع منصة المراقبة المركزية لشركة أجا.' },
      { step: 3, title: 'التشغيل والتتبع الحي', desc: 'إدارة الشحن البحري، الجوي، البري، والتخزين بتناغم كامل.' },
      { step: 4, title: 'التحليل وتخفيض التكاليف', desc: 'استعراض تقارير الأداء وتطوير الكفاءة التشغيلية باستمرار.' }
    ],
    industries: ['Enterprise Corporations', 'Global Trade Conglomerates', 'Oil & Gas Sector', 'Retail & FMCG Chains'],
    arabicIndustries: ['الشركات والمؤسسات الكبرى', 'مجموعات التجارة العالمية', 'قطاع النفط والغاز', 'سلاسل التجزئة والأغذية'],

    // Legacy fields mapping
    titleAr: 'حلول سلاسل الإمداد المتكاملة (Supply Chain Solutions)',
    titleEn: 'SUPPLY CHAIN SOLUTIONS',
    descriptionAr: 'حلول لوجستية متكاملة صُممت حول متطلبات عملك لتعزيز المرونة والشفافية وتوفير التكاليف.',
    descriptionEn: 'Integrated logistics solutions designed around your business.',
    iconName: 'Activity',
    featuresAr: ['لوحة قيادة مركزية (Control Tower) لجميع الشحنات والمستندات', 'التنبؤ بمواعيد الوصول المعتمدة على الذكاء الاصطناعي', 'تقارير تحليلية للتكاليف، الأداء الملاحي، وكفاءة الموردين'],
    featuresEn: ['Central control tower dashboard for real-time cargo tracking', 'AI-driven predictive estimated time of arrival (pETA)', 'Comprehensive analytics on spend, carrier performance, and carbon metrics'],
    benefitsAr: [
      'هيكلية لوجستية 4PL مخصصة بالكامل لتتناسب مع أهداف منشأتك',
      'لوحة قيادة مركزية (Control Tower) تتبع كافة الشحنات والمستودعات',
      'خوارزميات تنبؤية بالذكاء الاصطناعي لاكتشاف التأخيرات مبكراً',
      'فواتير موحدة وإدارة شاملة للموردين مع تقارير كفاءة الأداء'
    ],
    benefitsEn: [
      'Tailored end-to-end 4PL architecture customized for your business KPIs',
      'Centralized Control Tower dashboard monitoring all regional cargo movements',
      'Predictive AI ETA algorithms detecting route bottlenecks before delays occur',
      'Unified enterprise billing, vendor management, and carbon emissions auditing'
    ],
    processAr: [
      { step: 1, title: 'تحليل سلسلة الإمداد', desc: 'تقييم المسارات الحالية وتكاليف الشحن ومعدلات التأخير.' },
      { step: 2, title: 'الربط البرمجي المركزي', desc: 'ربط أنظمة الشركة ERP مع منصة المراقبة المركزية لشركة أجا.' },
      { step: 3, title: 'التشغيل والتتبع الحي', desc: 'إدارة الشحن البحري، الجوي، البري، والتخزين بتناغم كامل.' },
      { step: 4, title: 'التحليل وتخفيض التكاليف', desc: 'استعراض تقارير الأداء وتطوير الكفاءة التشغيلية باستمرار.' }
    ],
    processEn: [
      { step: 1, title: 'Supply Chain Audit', desc: 'Analyzing current freight bottlenecks, carrier costs, and lead times.' },
      { step: 2, title: 'Control Tower Integration', desc: 'Connecting corporate ERP via secure APIs to our central logistics portal.' },
      { step: 3, title: 'Execution & Live Telemetry', desc: 'Orchestrating multi-modal transport and warehouse operations seamlessly.' },
      { step: 4, title: 'Analytics & Continuous Optimization', desc: 'Reviewing quarterly KPI performance metrics to drive down supply chain spend.' }
    ],
    industriesAr: ['الشركات والمؤسسات الكبرى', 'مجموعات التجارة العالمية', 'قطاع النفط والغاز', 'سلاسل التجزئة والأغذية'],
    industriesEn: ['Enterprise Corporations', 'Global Trade Conglomerates', 'Oil & Gas Sector', 'Retail & FMCG Chains'],
    cta: {
      titleAr: 'هل تريد تصميم حلول سلاسل إمداد مخصصة لشركتك؟',
      titleEn: 'Ready for Tailored Supply Chain Solutions?',
      descAr: 'تحدث مع مستشاري أجا للحلول اللوجستية لبناء برج المراقبة الخاص بك.',
      descEn: 'Schedule a consultation session with our 4PL logistics architects.',
      buttonTextAr: 'طلب استشارة لوجستية',
      buttonTextEn: 'Schedule Consultation'
    }
  }
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  if (!slug) return undefined;
  const cleanSlug = slug.toLowerCase().trim();
  return SERVICES_DATA.find(
    (s) => 
      s.slug.toLowerCase() === cleanSlug || 
      (s.id && s.id.toLowerCase() === cleanSlug) ||
      (cleanSlug === 'customs-clearance' && s.id === 'customs') ||
      (cleanSlug === 'supply-chain' && s.id === 'supply-chain-solutions') ||
      (cleanSlug === 'land-freight' && s.id === 'land-transport')
  );
}

