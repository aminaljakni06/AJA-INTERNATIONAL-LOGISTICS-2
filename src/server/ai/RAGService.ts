import { RAGKnowledgeDoc, RAGSearchResult } from './types';

export class RAGService {
  private static readonly KNOWLEDGE_BASE: RAGKnowledgeDoc[] = [
    {
      id: 'DOC-POL-001',
      title: 'سياسة الفسح الجمركي والتخليص المعتمدة بالموانئ السعودية (Fasah Policy)',
      category: 'POLICY',
      content: 'تتطلب هيئة الزكاة والضريبة والجمارك (ZATCA) عبر منصة فسح تقديم الفاتورة التجارية المصدقة، قائمة التعبئة التفصيلية، بوليصة الشحن البحرية/الجوية، وشهادة المنشأ المطابقة للهيئة السعودية للمواصفات والمقاييس (SASO/SABER). تبلغ المهلة القياسية للتخليص 24-48 ساعة من تاريخ وصول المانفيست.',
      metadata: { authority: 'ZATCA / Fasah', jurisdiction: 'Saudi Arabia', updated: '2026-01-15' },
      updatedAt: '2026-01-15',
    },
    {
      id: 'DOC-POL-002',
      title: 'AJA Standard Terms & Conditions for Ocean & Land Freight 2026',
      category: 'CONTRACT',
      content: 'تعتمد شركة أجا للخدمات اللوجستية حدود المسؤولية القانونية وفق اتفاقية الهيئة العامة للنقل والاتفاقيات الدولية (Incoterms 2020 - FOB, CIF, DDP, DAP). الحد الأقصى للمسؤولية عن التأخير أو التلف ما لم يتم شراء تغطية تأمينية شاملة هو 2 SDR لكل كيلوجرام.',
      metadata: { standard: 'Incoterms 2020', legalLimit: '2 SDR/kg', carrier: 'AJA Logistics' },
      updatedAt: '2026-02-01',
    },
    {
      id: 'DOC-FIN-003',
      title: 'دليل ربط ضريبة القيمة المضافة ZATCA Phase 2 E-Invoicing Standard',
      category: 'FINANCE',
      content: 'تلتزم أجا للخدمات اللوجستية بإصدار الفواتير الضريبية الإلكترونية المباشرة عبر ZATCA Phase 2 (Integration Phase) الموثقة برمز QR وشفرة التشفير B2B / B2C بصيغة UBL 2.1 XML المخزنة في سجل الدفاتر المالية Immutable Ledger.',
      metadata: { zatcaPhase: 'Phase 2 Integration', format: 'UBL 2.1 XML', taxRate: '15%' },
      updatedAt: '2026-01-10',
    },
    {
      id: 'DOC-ERP-004',
      title: 'AJA Smart Warehouse WMS & WES Dynamic Slotting Policy',
      category: 'WAREHOUSE',
      content: 'يتم توزيع الأصناف داخل مستودعات أجا الذكية (Riyadh Hub & Jeddah Central) بناءً على تحليل ABC Velocity Analysis حيث توضع المنتجات الأكثر تداولاً (Class A) قرب أرصفة الاستلام والتحميل لتقليل زمن قطع المسافات بنسبة 35%.',
      metadata: { hub: 'Riyadh & Jeddah', algorithm: 'ABC Velocity Slotting', reductionPct: 35 },
      updatedAt: '2026-03-01',
    },
    {
      id: 'DOC-TRE-005',
      title: 'Enterprise Treasury & Multi-Currency Liquidity Policy',
      category: 'FINANCE',
      content: 'تدار سيولة شركة أجا عبر حسابات بنكية مقسمة بين SAR, USD, EUR, AED. يتم تطبيق التحوط الاحترازي ضد تقلبات العملات (FX Hedging) عندما تتجاوز الانكشافات المالية للمشتريات الدولية مبلغ 1,000,000 دولار أمريكي.',
      metadata: { baseCurrency: 'SAR', supportedCurrencies: ['SAR', 'USD', 'EUR', 'AED'], fxThresholdUSD: 1000000 },
      updatedAt: '2026-02-20',
    },
  ];

  public static async searchKnowledge(
    query: string,
    categoryFilter?: string,
    topK = 3
  ): Promise<RAGSearchResult> {
    const lowerQuery = query.toLowerCase();
    
    // Hybrid scoring algorithm combining keyword matches and simulated vector similarity
    const scoredDocs = this.KNOWLEDGE_BASE.map((doc) => {
      let score = 0;
      const lowerTitle = doc.title.toLowerCase();
      const lowerContent = doc.content.toLowerCase();

      if (categoryFilter && doc.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        score -= 0.5;
      }

      // Keyword occurrences
      const queryTerms = lowerQuery.split(/\s+/).filter((t) => t.length > 2);
      queryTerms.forEach((term) => {
        if (lowerTitle.includes(term)) score += 0.4;
        if (lowerContent.includes(term)) score += 0.2;
      });

      // Semantic proximity booster
      if (lowerQuery.includes('جمارك') || lowerQuery.includes('customs') || lowerQuery.includes('فسح')) {
        if (doc.id === 'DOC-POL-001') score += 0.5;
      }
      if (lowerQuery.includes('فاتورة') || lowerQuery.includes('ضريبة') || lowerQuery.includes('zatca')) {
        if (doc.id === 'DOC-FIN-003') score += 0.5;
      }
      if (lowerQuery.includes('مستودع') || lowerQuery.includes('تخزين') || lowerQuery.includes('wms')) {
        if (doc.id === 'DOC-ERP-004') score += 0.5;
      }

      return { doc, score: Math.min(Math.max(score, 0.1), 0.98) };
    });

    // Sort by relevance score
    scoredDocs.sort((a, b) => b.score - a.score);
    const topMatches = scoredDocs.slice(0, topK);

    const docResults = topMatches.map((item) => ({
      id: item.doc.id,
      title: item.doc.title,
      category: item.doc.category,
      snippet: item.doc.content.slice(0, 180) + '...',
      relevanceScore: Math.round(item.score * 100) / 100,
      citation: `[المرجع المؤسسي: ${item.doc.id} - ${item.doc.title}]`,
    }));

    // Synthesize synthesized answer
    let synthesizedAnswer = 'بناءً على قاعدة المعرفة والوثائق المؤسسية لشركة أجا اللوجستية:\n\n';
    if (docResults.length > 0) {
      docResults.forEach((d, idx) => {
        synthesizedAnswer += `${idx + 1}. **${d.title}** (${d.category}):\n   • ${d.snippet}\n   • المصدر: ${d.citation}\n\n`;
      });
    } else {
      synthesizedAnswer += 'لم يتم العثور على وثائق مطابقة بدقة عالية في قاعدة المعرفة المحلية.';
    }

    const avgConfidence = docResults.length > 0 
      ? docResults.reduce((acc, curr) => acc + curr.relevanceScore, 0) / docResults.length 
      : 0.5;

    return {
      query,
      documents: docResults,
      synthesizedAnswer,
      confidenceScore: Math.round(avgConfidence * 100) / 100,
    };
  }

  public static getKnowledgeCount(): number {
    return this.KNOWLEDGE_BASE.length;
  }
}
