import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Globe,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Send,
  Languages
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AIConversationSummaryResponse } from '../../types/omnichannel';

interface AISummaryPanelProps {
  channel: string;
  title: string;
  content: string;
  onApplyReply?: (text: string) => void;
}

export const AISummaryPanel: React.FC<AISummaryPanelProps> = ({
  channel,
  title,
  content,
  onApplyReply,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AIConversationSummaryResponse | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const handleAnalyze = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch('/api/crm/omnichannel/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, title, content }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSummaryData(data.result);
      }
    } catch (err) {
      console.error('[AI Summary Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!content) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/crm/omnichannel/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, targetLanguage: 'ar' }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translatedText);
      }
    } catch (err) {
      console.error('[AI Translate Error]', err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card className="p-4 bg-slate-900/90 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
              مساعد التواصل والتحليل الذكي (AJA AI Engine)
            </h4>
            <p className="text-[10px] text-slate-400">تلخيص المحادثات، تحليل المشاعر، واقتراح الردود</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTranslate}
            disabled={translating}
            className="text-[11px] h-7 border-slate-700 text-slate-300 hover:bg-slate-800 gap-1"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            {translating ? 'جاري الترجمة...' : 'ترجمة للعربية'}
          </Button>

          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] h-7 gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'جاري التحليل...' : 'تحليل وتلخيص الذكاء الاصطناعي'}
          </Button>
        </div>
      </div>

      {/* Translation Output if requested */}
      {translatedText && (
        <div className="p-3 bg-sky-950/40 border border-sky-800/50 rounded-lg space-y-1">
          <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            الترجمة الفورية
          </div>
          <p className="text-xs text-slate-200 leading-relaxed dir-rtl">{translatedText}</p>
        </div>
      )}

      {/* AI Analysis Results */}
      {summaryData ? (
        <div className="space-y-4">
          {/* Sentiment & Risk Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">انطباع التواصل (Sentiment)</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {summaryData.detectedSentiment}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block">مستوى المخاطرة (Risk)</span>
              <span className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
                summaryData.riskLevel === 'CRITICAL' || summaryData.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-sky-400'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {summaryData.riskLevel}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-400 block">تصنيف الموضوع</span>
              <span className="text-xs font-bold text-amber-300 mt-0.5 block truncate">
                {summaryData.detectedCategory}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <h5 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              الملخص التنفيذي للمحادثة
            </h5>
            <p className="text-slate-300 leading-relaxed text-xs">{summaryData.summary}</p>
          </div>

          {/* Key Takeaways & Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                أبرز النقاط المستخلصة
              </h5>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {summaryData.keyTakeaways?.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <h5 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                توصيات المتابعة القادمة
              </h5>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                {summaryData.suggestedFollowUps?.map((fu, i) => (
                  <li key={i}>{fu}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Response Suggestions */}
          {summaryData.responseSuggestions?.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-2">
              <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                ردود مقترحة جاهزة للاستخدام
              </h5>
              <div className="space-y-1.5">
                {summaryData.responseSuggestions.map((resp, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-2 hover:border-amber-500/50 transition-colors"
                  >
                    <span className="text-[11px] text-slate-200">{resp}</span>
                    {onApplyReply && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyReply(resp)}
                        className="text-[10px] h-6 px-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shrink-0 gap-1"
                      >
                        <Send className="w-3 h-3" />
                        اعتماد الرد
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400 bg-slate-950/40 border border-slate-800/50 rounded-xl space-y-2">
          <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto" />
          <p className="text-xs">اضغط على زر "تحليل وتلخيص الذكاء الاصطناعي" للحصول على تحليل فوري واستخلاص النقاط والردود الذكية.</p>
        </div>
      )}
    </Card>
  );
};
