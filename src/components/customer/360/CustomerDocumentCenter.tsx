import React from 'react';
import { FileText, Download, ShieldCheck, Calendar, Eye, Plus, AlertCircle } from 'lucide-react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { CustomerDocument360 } from '../../../types/customer360';

interface CustomerDocumentCenterProps {
  documents: CustomerDocument360[];
}

export const CustomerDocumentCenter: React.FC<CustomerDocumentCenterProps> = ({ documents }) => {
  return (
    <div className="space-y-6 text-slate-100 text-xs">
      <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>مركز المستندات والوثائق الموحدة 360</span>
          </h3>
          <p className="text-slate-300 text-xs mt-0.5">
            إدارة العقود، السجلات التجارية، الشهادات الضريبية، وبوالص الشحن الموثقة
          </p>
        </div>

        <Button variant="primary" size="sm" className="gap-2 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
          <Plus className="w-3.5 h-3.5" /> رفع مستند جديد
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700 p-4">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">لا توجد وثائق مرفوعة لحساب العميل.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-900/90 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-100 text-sm">{doc.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                    v{doc.version}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <p>اسم الملف: <span className="text-slate-200">{doc.fileName}</span></p>
                  <p>نوع المستند: <span className="text-amber-300">{doc.documentType}</span></p>
                  {doc.expiryDate && (
                    <p className="text-emerald-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>صالح حتى: {new Date(doc.expiryDate).toLocaleDateString('ar-SA')}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400">بواسطة: {doc.uploadedBy}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-1 text-slate-300 hover:text-white" title="معاينة المستند">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1 text-slate-300 hover:text-white" title="تحميل الملف">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
