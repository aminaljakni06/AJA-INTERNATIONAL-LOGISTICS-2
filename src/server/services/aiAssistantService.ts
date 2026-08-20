import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { AuthPayload } from '../auth';
import { 
  getShipmentById, 
  getShipmentByTrackingNumber, 
  listShipmentsForCustomer, 
  listAllShipments 
} from '../../db/repositories/shipmentRepository';
import { getEventsForShipment } from '../../db/repositories/shipmentEventRepository';
import { 
  getQuoteById, 
  getQuoteByRequestNumber, 
  listQuotesForCustomer, 
  listAllQuotes 
} from '../../db/repositories/quoteRequestRepository';
import { getRequiredDocuments, getAvailableServices } from '../../services/logisticsService';

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Tool Declarations
const getCustomerShipmentsTool: FunctionDeclaration = {
  name: 'get_customer_shipments',
  description: 'Fetches all active and historical shipments belonging to the authenticated customer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      statusFilter: {
        type: Type.STRING,
        description: 'Optional status filter: RECEIVED, IN_TRANSIT, DELIVERED, etc.',
      },
    },
  },
};

const getShipmentStatusTool: FunctionDeclaration = {
  name: 'get_shipment_status',
  description: 'Retrieves current status, location, origin, destination, shipping date, and estimated arrival for a specific shipment by tracking number or shipment ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      trackingNumber: {
        type: Type.STRING,
        description: 'Shipment tracking number or ID (e.g., AJA-123456-KSA or document ID)',
      },
    },
    required: ['trackingNumber'],
  },
};

const getShipmentTimelineTool: FunctionDeclaration = {
  name: 'get_shipment_timeline',
  description: 'Retrieves chronological status events, locations, timestamps, and tracking milestones for a specific shipment.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      trackingNumber: {
        type: Type.STRING,
        description: 'Shipment tracking number or ID (e.g., AJA-123456-KSA)',
      },
    },
    required: ['trackingNumber'],
  },
};

const getQuoteRequestStatusTool: FunctionDeclaration = {
  name: 'get_quote_request_status',
  description: 'Checks status, offered price, currency, validity, and response details for a quote request by quote ID or request number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      quoteId: {
        type: Type.STRING,
        description: 'Quote request ID or request number (e.g., REQ-123456 or QR-123)',
      },
    },
    required: ['quoteId'],
  },
};

const getRequiredDocumentsTool: FunctionDeclaration = {
  name: 'get_required_documents',
  description: 'Returns mandatory and recommended compliance, customs clearance, and transport documents required based on service type and origin/destination countries.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceType: {
        type: Type.STRING,
        description: 'Service type: SEA_FREIGHT, LAND_FREIGHT, CUSTOMS_CLEARANCE, WAREHOUSING, DOOR_TO_DOOR',
      },
      originCountry: {
        type: Type.STRING,
        description: 'Origin country (default: China / الصين)',
      },
      destinationCountry: {
        type: Type.STRING,
        description: 'Destination country (default: Saudi Arabia / السعودية)',
      },
    },
    required: ['serviceType'],
  },
};

const getAvailableServicesTool: FunctionDeclaration = {
  name: 'get_available_services',
  description: 'Returns catalog of Aja Logistics transport, ocean freight, land shipping, customs clearance, and warehousing services.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const ALL_TOOLS: FunctionDeclaration[] = [
  getCustomerShipmentsTool,
  getShipmentStatusTool,
  getShipmentTimelineTool,
  getQuoteRequestStatusTool,
  getRequiredDocumentsTool,
  getAvailableServicesTool,
];

// Tool Audit Logging & Secure Execution Layer
export async function executeTool(
  toolName: string,
  args: any,
  user: AuthPayload
): Promise<{ result: any; log: { toolName: string; args: any; status: string; timestamp: string } }> {
  const timestamp = new Date().toISOString();
  console.log(`[AI ASSISTANT TOOL EXECUTION] Time: ${timestamp} | User: ${user.email} (${user.userId}, ${user.role}) | Tool: ${toolName} | Args:`, args);

  try {
    let result: any = null;

    switch (toolName) {
      case 'get_customer_shipments': {
        if (user.role === 'CUSTOMER') {
          const list = await listShipmentsForCustomer(user.userId);
          result = list.map((s) => ({
            id: s.id,
            trackingNumber: s.trackingNumber,
            shipmentType: s.shipmentType,
            pickupLocation: s.pickupLocation,
            deliveryLocation: s.deliveryLocation,
            currentStatus: s.currentStatus,
            currentLocation: s.currentLocation,
            estimatedArrivalDate: s.estimatedArrivalDate,
            customerVisibleNotes: s.customerVisibleNotes,
          }));
        } else {
          const list = await listAllShipments();
          result = list.map((s) => ({
            id: s.id,
            trackingNumber: s.trackingNumber,
            customerId: s.customerId,
            shipmentType: s.shipmentType,
            pickupLocation: s.pickupLocation,
            deliveryLocation: s.deliveryLocation,
            currentStatus: s.currentStatus,
            currentLocation: s.currentLocation,
            estimatedArrivalDate: s.estimatedArrivalDate,
          }));
        }
        break;
      }

      case 'get_shipment_status': {
        const { trackingNumber } = args || {};
        if (!trackingNumber) {
          result = { error: 'يرجى تزويد رقم التتبع للاستعلام' };
          break;
        }

        let shipment = await getShipmentByTrackingNumber(trackingNumber);
        if (!shipment) {
          shipment = await getShipmentById(trackingNumber);
        }

        if (!shipment) {
          result = { error: `لم يتم العثور على أية شحنة برقم التتبع: ${trackingNumber}` };
          break;
        }

        // AUTHORIZATION CHECK
        if (user.role === 'CUSTOMER' && shipment.customerId !== user.userId) {
          result = { error: 'غير مصرح لك باستعراض حالة هذه الشحنة نظراً لأنها غير مسجلة في حسابك.' };
          break;
        }

        result = {
          trackingNumber: shipment.trackingNumber,
          shipmentType: shipment.shipmentType,
          currentStatus: shipment.currentStatus,
          currentLocation: shipment.currentLocation,
          pickupLocation: shipment.pickupLocation,
          deliveryLocation: shipment.deliveryLocation,
          shippingDate: shipment.shippingDate,
          estimatedArrivalDate: shipment.estimatedArrivalDate,
          customerNotes: shipment.customerVisibleNotes,
        };
        break;
      }

      case 'get_shipment_timeline': {
        const { trackingNumber } = args || {};
        if (!trackingNumber) {
          result = { error: 'يرجى تزويد رقم التتبع' };
          break;
        }

        let shipment = await getShipmentByTrackingNumber(trackingNumber);
        if (!shipment) {
          shipment = await getShipmentById(trackingNumber);
        }

        if (!shipment) {
          result = { error: `لم يتم العثور على أية شحنة برقم التتبع: ${trackingNumber}` };
          break;
        }

        // AUTHORIZATION CHECK
        if (user.role === 'CUSTOMER' && shipment.customerId !== user.userId) {
          result = { error: 'غير مصرح لك باستعراض الجدول الزمني لهذه الشحنة.' };
          break;
        }

        const events = await getEventsForShipment(shipment.id, user.role === 'CUSTOMER');
        result = {
          trackingNumber: shipment.trackingNumber,
          currentStatus: shipment.currentStatus,
          timelineEvents: events.map((e) => ({
            status: e.status,
            location: e.location,
            description: e.description,
            timestamp: e.createdAt,
          })),
        };
        break;
      }

      case 'get_quote_request_status': {
        const { quoteId } = args || {};
        if (!quoteId) {
          result = { error: 'يرجى تزويد رقم طلب عرض السعر' };
          break;
        }

        let quote = await getQuoteById(quoteId);
        if (!quote) {
          quote = await getQuoteByRequestNumber(quoteId);
        }

        // If still not found, search user's quote list for partial match
        if (!quote && user.role === 'CUSTOMER') {
          const userQuotes = await listQuotesForCustomer(user.userId);
          quote = userQuotes.find((q) => q.id === quoteId || q.requestNumber === quoteId) || null;
        }

        if (!quote) {
          result = { error: `لم يتم العثور على طلب عرض السعر برقم: ${quoteId}` };
          break;
        }

        // AUTHORIZATION CHECK
        if (user.role === 'CUSTOMER' && quote.customerId !== user.userId) {
          result = { error: 'غير مصرح لك باستعراض تفاصيل طلب عرض السعر هذا.' };
          break;
        }

        result = {
          requestNumber: quote.requestNumber,
          status: quote.status,
          shipmentType: quote.shipmentType,
          pickupLocation: quote.pickupLocation,
          deliveryLocation: quote.deliveryLocation,
          cargoType: quote.cargoType,
          createdAt: quote.createdAt,
          quoteResponse: quote.quoteResponse
            ? {
                offeredPrice: quote.quoteResponse.offeredPrice,
                currency: quote.quoteResponse.currency || 'SAR',
                validUntil: quote.quoteResponse.validUntil,
                terms: quote.quoteResponse.terms,
              }
            : 'لم يتم تصدير عرض السعر المالي بعد (قيد الدراسة)',
        };
        break;
      }

      case 'get_required_documents': {
        const serviceType = args?.serviceType || 'SEA_FREIGHT';
        const origin = args?.originCountry || 'الصين';
        const dest = args?.destinationCountry || 'السعودية';
        result = getRequiredDocuments(serviceType as any, origin, dest);
        break;
      }

      case 'get_available_services': {
        result = getAvailableServices();
        break;
      }

      default:
        result = { error: `أداة غير معروفة: ${toolName}` };
    }

    return {
      result,
      log: { toolName, args, status: 'SUCCESS', timestamp },
    };
  } catch (err: any) {
    console.error(`[AI TOOL ERROR] Tool: ${toolName} failed:`, err);
    return {
      result: { error: `حدث خطأ أثناء تنفيذ الأداة: ${err.message}` },
      log: { toolName, args, status: 'ERROR', timestamp },
    };
  }
}

// System Instruction
const SYSTEM_INSTRUCTION = `
أنت "مساعد شركة أجا اللوجستية الذكي" (Aja Logistics AI Assistant)، خبير الدعم اللوجستي المعتمد لشركة "شركة أجا للخدمات اللوجستية" بالمملكة العربية السعودية.

مهامك الرئيسية المعتمدة:
1. المساعدة في اختيار الخدمة المناسبة (الشحن البحري Sea Freight، الشحن الجوي Air Freight، النقل البري Land Freight، التخليص الجمركي Customs Clearance، والتخزين Warehousing) بناءً على طبيعة الحجم، الوزن، والوجهة.
2. التوضيح والدقة في المقارنة بين وسائل الشحن (مثلاً: الفرق بين الشحن البحري Sea Freight والنقل البري Land Transportation من حيث السعة، التكلفة، والسرعة).
3. شرح حالة الشحنات الحالية بدقة بناءً على بيانات النظام الحقيقية.
4. تبسيط وشرح مراحل الشحن اللوجستي (الاستلام، الفحص، التخليص الجمركي، الشحن والتتبع، والوصول).
5. المساعدة والتحضير لتقديم طلب عرض سعر (Quote Request) عبر تحديد: نقطة القيام، نقطة الوصول، نوع البضاعة، الوزن الحجمي CBM، وتصنيف الشحنة.

قواعد الأمان والضوابط الصارمة جداً (Anti-Hallucination Guardrails):
1. يُحظر حظراً مطلقاً اختراع، أو افتراض، أو تخمين أي أسعار محددة، أو مواعيد وصول مؤكدة، أو حالات شحنة غير موجودة، أو معلومات تشغيلية غير متاحة في النظام.
2. إذا لم تتوفر بيانات حقيقية لشحنة أو طلب عرض سعر من خلال الأدوات المتاحة (Tools)، يجب الإجابة بوضوح تام بعبارة: "البيانات غير متاحة حالياً" أو "المعلومات غير متوفرة في النظام".
3. اعتمد كلياً على البيانات الحقيقية العائدة من استدعاء الأدوات فقط (Tools).
4. اكتب إجاباتك باللغة العربية الواضحة بأسلوب مهني ومباشر، منسق بنقاط واضحة.
`;

// AI Processing Loop Handler
export async function processAIAssistantChat(
  message: string,
  chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  user: AuthPayload
): Promise<{
  reply: string;
  toolLogs: Array<{ toolName: string; args: any; status: string; timestamp: string }>;
}> {
  const toolLogs: Array<{ toolName: string; args: any; status: string; timestamp: string }> = [];

  // Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback Rule-Based AI Engine when Gemini API key is not configured in env
    return handleRuleBasedAIFallback(message, user);
  }

  const ai = getGeminiClient();

  // Construct conversation contents
  const contents: any[] = [];

  // Append history
  if (Array.isArray(chatHistory)) {
    for (const h of chatHistory) {
      contents.push({
        role: h.role,
        parts: h.parts,
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  let currentLoop = 0;
  const maxLoops = 5;

  while (currentLoop < maxLoops) {
    currentLoop++;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: ALL_TOOLS }],
      },
    });

    const candidate = response.candidates?.[0];
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      // Append model response with functionCalls to contents to maintain context
      if (candidate?.content) {
        contents.push(candidate.content);
      }

      // Execute each tool call securely
      const toolResponseParts: any[] = [];
      for (const call of functionCalls) {
        const { name, args, id } = call;
        const { result, log } = await executeTool(name, args, user);
        toolLogs.push(log);

        toolResponseParts.push({
          functionResponse: {
            name,
            response: result,
            id,
          },
        });
      }

      // Feed function responses back into Gemini model context
      contents.push({
        role: 'user',
        parts: toolResponseParts,
      });

      // Loop again to let Gemini synthesize the tool outputs into final user text
      continue;
    }

    // No further function calls -> return model text response
    const replyText = response.text || 'شرفنا بخدمتك في شركة أجا اللوجستية. يرجى توضيح استفسارك أو تزويدنا برقم التتبع.';
    return {
      reply: replyText,
      toolLogs,
    };
  }

  return {
    reply: 'تم استكمال الاستعلام بنجاح عبر أنظمة شركة أجا اللوجستية.',
    toolLogs,
  };
}

/**
 * Intelligent Rule-Based Fallback Engine
 * Provides precise guidance on services, comparison, quote requests, and shipping stages
 * enforcing strict "البيانات غير متاحة حالياً" guardrails when live database items aren't found.
 */
async function handleRuleBasedAIFallback(
  message: string,
  user: AuthPayload
): Promise<{
  reply: string;
  toolLogs: Array<{ toolName: string; args: any; status: string; timestamp: string }>;
}> {
  const lower = message.toLowerCase();
  const toolLogs: Array<{ toolName: string; args: any; status: string; timestamp: string }> = [];

  // Check if asking about tracking or shipment status
  if (lower.includes('تتبع') || lower.includes('شحنة') || lower.includes('شحناتي') || lower.includes('tracking')) {
    const { result, log } = await executeTool('get_customer_shipments', {}, user);
    toolLogs.push(log);

    if (Array.isArray(result) && result.length > 0) {
      let reply = `أهلاً بك أ. ${user.fullName || ''}. بناءً على سجل شحناتك الحقيقية في منصتنا:\n\n`;
      result.forEach((s, idx) => {
        reply += `${idx + 1}. **شحنة ${s.trackingNumber}** (${s.shipmentType}):\n`;
        reply += `   • الحالة: ${s.currentStatus}\n`;
        reply += `   • الموقع الحالي: ${s.currentLocation || 'قيد المتابعة'}\n`;
        reply += `   • تاريخ الوصول المتوقع: ${s.estimatedArrivalDate || 'البيانات غير متاحة حالياً'}\n\n`;
      });
      return { reply, toolLogs };
    } else {
      return {
        reply: `أهلاً بك أ. ${user.fullName || ''}.\n\nالبيانات غير متاحة حالياً لا توجد شحنات نشطة مسجلة بهذا الرقم أو الحساب.\n\nيمكنك تقديم طلب جديد أو تزويدنا برقم تتبع صحيح للاستعلام.`,
        toolLogs,
      };
    }
  }

  // Check if asking about Sea Freight vs Land Freight comparison
  if ((lower.includes('بحري') && lower.includes('بري')) || lower.includes('فرق') || lower.includes('sea freight') || lower.includes('land')) {
    const reply = `**مقارنة بين الشحن البحري (Sea Freight) والنقل البري (Land Freight):**\n\n` +
      `🚢 **الشحن البحري (Sea Freight):**\n` +
      `• **الاستخدام المثالي:** البضائع الضخمة والحاويات (FCL/LCL) الشديدة الوزن بين القارات والبلدان البعيدة (مثل الصين/أوروبا إلى السعودية).\n` +
      `• **المميزات:** أقل تكلفة لكل طن، سعة استيعابية هائلة.\n` +
      `• **المدة المتوقعة:** أطول نسبياً (تعتمد على المسار البحري والجدول الملاحي).\n\n` +
      `🚛 **النقل البري (Land Freight):**\n` +
      `• **الاستخدام المثالي:** التوزيع الداخلي بالمملكة، والشحن بين دول مجلس التعاون الخليجي والشرق الأوسط.\n` +
      `• **المميزات:** مرونة في التسليم من الباب إلى الباب (Door-to-Door)، سرعة عالية في الترانزيت المباشر.\n` +
      `• **ملاحظة:** الأسعار الدقيقة تعتمد على مواصفات الشحنة والمسار عند طلب عرض السعر.`;
    return { reply, toolLogs };
  }

  // Check if asking about Shipping Stages (مراحل الشحن)
  if (lower.includes('مراحل') || lower.includes('مرحلة') || lower.includes('خطوات') || lower.includes('stages')) {
    const reply = `**مراحل الشحن اللوجستي لدى شركة أجا:**\n\n` +
      `1️⃣ **استلام الشحنة وتأكيد الطلب (Order Received):** استلام البضاعة من المصنع أو المورد وفحصها.\n` +
      `2️⃣ **التجهيز والتحميل (Processing & Loading):** تعبئة الحاوية وتجهيز قائمة التعبئة (Packing List) والشاف الملاحي.\n` +
      `3️⃣ **التخليص الجمركي للتصدير (Export Clearance):** إنهاء إجراءات الفسح في ميناء القيام.\n` +
      `4️⃣ **الانطلاق في الترانزيت (In Transit):** الإبحار البحري أو الرحلة الجوية/البرية باتجاه الوجهة.\n` +
      `5️⃣ **الوصول والتخليص بالمنفذ (Port Customs Clearance):** الفسح الجمركي عبر منصة فسح بالموانئ السعودية.\n` +
      `6️⃣ **التسليم النهائي (Final Delivery):** النقل البري إلى مستودع أو مقر العميل.`;
    return { reply, toolLogs };
  }

  // Check if asking about Quote Request preparation (تجهيز عرض سعر)
  if (lower.includes('عرض') || lower.includes('سعر') || lower.includes('quote') || lower.includes('طلب')) {
    const reply = `**خطوات تجهيز طلب عرض السعر (Quote Request) المثالي:**\n\n` +
      `لإعداد طلب عرض سعر دقيق وسريع عبر منصة أجا اللوجستية، يرجى تجهيز البيانات التالية:\n` +
      `1. **نوع الخدمة المطلوبة:** (شحن بحري، شحن جوي، نقل بري، أو تخليص جمركي).\n` +
      `2. **موقع الاستلام (Origin):** (المدينة والبلد المصدر، مثلاً: ميناء نينغبو - الصين).\n` +
      `3. **موقع التسليم (Destination):** (المدينة والمنفذ المستهدف، مثلاً: الرياض أو ميناء جدة).\n` +
      `4. **تفاصيل البضاعة والوزن الحجمي:** (الوزن الإجمالي بالكيلوجرام، الحجم بالـ CBM، أو عدد الحاويات).\n` +
      `5. **المستندات المتوفرة:** (الفاتورة التجارية وقائمة التعبئة).\n\n` +
      `يمكنك الانتقال فوراً لصفحة **"طلب عرض سعر"** بإنشاء الطلب رسمياً وسيتم مراجعته من فريق العمليات.`;
    return { reply, toolLogs };
  }

  // Default Guidance Response
  return {
    reply: `أهلاً بك أ. ${user.fullName || 'العميل العزيز'}.\n\nأنا مساعد أجا اللوجستي الذكي. كيف يمكنني مساعدتك اليوم؟\n\n` +
      `يمكنني مساعدتك في:\n` +
      `• **اختيار الخدمة اللوجستية المناسبة** لنوع بضاعتك.\n` +
      `• **المقارنة بين الشحن البحري والنقل البري والخدمات المختلفة**.\n` +
      `• **تتبع حالة شحناتك الحقيقية المسجلة بالتطبيق**.\n` +
      `• **شرح مراحل الشحن والوثائق المطلوبة للتخليص الجمركي**.\n` +
      `• **إرشادات تجهيز طلب عرض السعر (Quote Request)**.\n\n` +
      `تفضل بكتابة سؤالك بالتفصيل!`,
    toolLogs,
  };
}
