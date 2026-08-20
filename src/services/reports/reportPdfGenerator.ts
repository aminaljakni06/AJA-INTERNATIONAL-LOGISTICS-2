/**
 * AJA INTERNATIONAL LOGISTICS — Executive PDF Summary Generator
 * Parent Phase: STEP 05.19 — Enterprise Reporting, Executive Analytics & Data Intelligence Engine
 * Module: Parameterized Report Builder, PDF Summary Generation & Scheduled Reports (STEP 05.19.10)
 * Version: 1.0
 */

import { ReportExecutionResult } from '../../types/reportFramework';
import { exportToPdf } from '../../utils/pdfExport';

export class ReportPdfGenerator {
  /**
   * Builds formatted HTML container from ReportExecutionResult and triggers browser PDF export/print.
   */
  public async generateReportPdf(
    result: ReportExecutionResult,
    language: 'ar' | 'en' = 'ar'
  ): Promise<void> {
    const isAr = language === 'ar';
    const direction = isAr ? 'rtl' : 'ltr';

    const formattedDate = new Date(result.generatedAt).toLocaleString(isAr ? 'ar-SA' : 'en-US');

    // Build KPI HTML
    const metricCardsHtml = Object.values(result.metrics)
      .map((metric) => {
        const title = isAr ? metric.labelAr : metric.labelEn;
        const val = metric.formattedValue;
        return `
          <div style="flex: 1 1 45%; min-width: 200px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; box-sizing: border-box;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a;">${val}</div>
          </div>
        `;
      })
      .join('');

    // Build Grouped Section HTML
    const groupedSectionsHtml = Object.values(result.groupedResults)
      .map((grouped) => {
        const rowsHtml = grouped.groups
          .map(
            (g) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-size: 11px;">${isAr ? g.labelAr : g.labelEn}</td>
            <td style="padding: 8px 12px; font-size: 11px; text-align: center;">${g.count}</td>
            <td style="padding: 8px 12px; font-size: 11px; text-align: ${isAr ? 'left' : 'right'}; font-weight: 700;">${g.value}</td>
          </tr>
        `
          )
          .join('');

        return `
          <div style="margin-top: 20px;">
            <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 8px; font-weight: 700;">
              ${isAr ? `التحليل المجمع حسب: ${grouped.dimension}` : `Grouped Analysis: ${grouped.dimension}`}
            </h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 6px;">
              <thead>
                <tr style="background-color: #f1f5f9; color: #334155; text-align: ${isAr ? 'right' : 'left'}; font-size: 11px;">
                  <th style="padding: 8px 12px;">${isAr ? 'البند / الفئة' : 'Category'}</th>
                  <th style="padding: 8px 12px; text-align: center;">${isAr ? 'العدد' : 'Count'}</th>
                  <th style="padding: 8px 12px; text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'القيمة / المجموع' : 'Total Value'}</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    // Assemble Full Document HTML
    const reportHtml = `
      <div id="pdf-report-container" style="direction: ${direction}; font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 24px; max-width: 900px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0369a1; margin: 0 0 4px 0;">
              ${isAr ? result.reportTitleAr : result.reportTitleEn}
            </h1>
            <div style="font-size: 11px; color: #64748b;">
              ${isAr ? 'شركة أجا العالمية للخدمات اللوجستية' : 'AJA International Logistics Co.'} | ${isAr ? 'معرف التقرير' : 'Execution ID'}: ${result.executionId}
            </div>
          </div>
          <div style="text-align: ${isAr ? 'left' : 'right'}; font-size: 11px; color: #475569;">
            <div><strong>${isAr ? 'تاريخ الإصدار' : 'Generated At'}:</strong> ${formattedDate}</div>
            <div><strong>${isAr ? 'عملة التقرير' : 'Currency'}:</strong> ${result.reportingCurrency}</div>
            <div><strong>${isAr ? 'نطاق البيانات' : 'Completeness'}:</strong> <span style="color: #16a34a; font-weight: 700;">${result.completeness}</span></div>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          ${metricCardsHtml}
        </div>

        <!-- Grouped Sections -->
        ${groupedSectionsHtml}

        <!-- Footer / Confidentiality -->
        <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
          <div>
            ${isAr ? 'وثيقة رسمية سرية وحصرية — أجا اللوجستية' : 'Confidential Official Report — AJA Logistics'}
          </div>
          <div>
            ${isAr ? `تم التشغيل في ${result.executionTimeMs} ملي ثانية` : `Executed in ${result.executionTimeMs}ms`}
          </div>
        </div>
      </div>
    `;

    // Render to printable window / DOM export
    const title = isAr ? result.reportTitleAr : result.reportTitleEn;
    await exportToPdf('pdf-report-container', `${title.replace(/\s+/g, '_')}_${result.executionId}`, reportHtml);
  }
}

export const reportPdfGenerator = new ReportPdfGenerator();
