import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, AlertCircle, CheckCircle2, ShieldCheck, FileCheck, FileSpreadsheet, FileCode, Paperclip } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export interface ShipmentDocumentsManagerProps {
  ownerType: 'SHIPMENT' | 'QUOTE' | 'CUSTOMER';
  ownerId: string;
  title?: string;
  readOnly?: boolean;
}

const CATEGORIES: { key: string; labelAr: string; icon: any }[] = [
  { key: 'COMMERCIAL_INVOICE', labelAr: 'الفاتورة التجارية (Commercial Invoice)', icon: FileSpreadsheet },
  { key: 'PACKING_LIST', labelAr: 'قائمة التعبئة (Packing List)', icon: FileText },
  { key: 'IDENTITY_OR_COMPANY', labelAr: 'وثائق الهوية أو السجل التجاري', icon: FileCheck },
  { key: 'ADDITIONAL', labelAr: 'مستندات وتصاريح إضافية', icon: Paperclip },
];

export const ShipmentDocumentsManager: React.FC<ShipmentDocumentsManagerProps> = ({
  ownerType,
  ownerId,
  title = 'مستندات ووثائق الشحنة',
  readOnly = false,
}) => {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload Form State
  const [selectedCategory, setSelectedCategory] = useState('COMMERCIAL_INVOICE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = () => {
    if (!token || !ownerId) return;
    setLoading(true);
    fetch(`/api/documents/owner/${ownerType}/${ownerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [token, ownerType, ownerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('حجم الملف كبير جداً. الحد الأقصى المسموح هو 10 ميجابايت.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) {
      setError('يرجى اختيار ملف أولاً.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = reader.result as string;

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ownerType,
            ownerId,
            category: selectedCategory,
            fileName: selectedFile.name,
            fileType: selectedFile.type || 'application/octet-stream',
            fileSize: selectedFile.size,
            fileData,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'فشل رفع المستند');
        }

        setSuccess(`تم رفع المستند (${selectedFile.name}) بنجاح!`);
        setSelectedFile(null);
        fetchDocuments();
      };

      reader.onerror = () => {
        setError('حدث خطأ أثناء قراءة الملف');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setError(err.message || 'فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/documents/${docId}/download?format=json`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل تحميل الملف');
        return;
      }

      if (data.fileData) {
        const a = document.createElement('a');
        a.href = data.fileData;
        a.download = data.fileName || fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحميل الملف');
    }
  };

  const handleDelete = async (docId: string, fileName: string) => {
    if (!token) return;
    if (!window.confirm(`هل أنت تأكد من إزالة وتدمير المستند (${fileName}) من السجل؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess(`تم حذف المستند (${fileName}) بنجاح`);
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حذف المستند');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (catKey: string) => {
    const found = CATEGORIES.find((c) => c.key === catKey);
    return found ? found.labelAr : 'مستند إضافي';
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <FileText className="w-4 h-4 text-[#0F4C75]" />
          <span>{title}</span>
        </div>
      }
      headerAction={
        <span className="text-xs text-slate-500 font-medium">
          إجمالي المستندات: <strong className="text-slate-900 font-mono">{documents.length}</strong>
        </span>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Upload Form */}
        {!readOnly && (
          <form onSubmit={handleUpload} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#0F4C75]" />
              <span>رفع مستند أو وثيقة جديدة</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">تصنيف المستند المرفوع:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-[#0F4C75]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">اختيار الملف (PDF, PNG, JPG, DOCX):</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  className="w-full text-xs text-slate-600 file:mr-0 file:ml-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#082F49] file:text-white hover:file:bg-[#0F4C75] cursor-pointer"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-900 font-medium">
                <span>الملف المحدد: <strong>{selectedFile.name}</strong> ({formatBytes(selectedFile.size)})</span>
                <span className="text-[10px] text-blue-700 font-mono">جاهز للرفع</span>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                variant="primary"
                size="sm"
                className="font-bold gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'جاري رفع المستند...' : 'حفظ ورفع المستند'}</span>
              </Button>
            </div>
          </form>
        )}

        {/* Documents Table List */}
        {loading ? (
          <LoadingSpinner label="جاري استدعاء المستندات والملفات المرفقة..." />
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-1">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">لا توجد مستندات مرفقة حالياً</p>
            <p className="text-[11px] text-slate-400">قم برفع الفاتورة التجارية، قائمة التعبئة، أو الأوراق الرسمية للبدء.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">نوع التصنيف</th>
                  <th className="p-2.5">اسم المستند</th>
                  <th className="p-2.5">الحجم</th>
                  <th className="p-2.5">بواسطة</th>
                  <th className="p-2.5">تاريخ الرفع</th>
                  <th className="p-2.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 font-mono">
                      {doc.fileName}
                    </td>
                    <td className="p-2.5 text-slate-500 font-mono">{formatBytes(doc.fileSize)}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.uploadedByRole === 'ADMIN' || doc.uploadedByRole === 'STAFF'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {doc.uploadedByRole === 'ADMIN' || doc.uploadedByRole === 'STAFF' ? 'الإدارة' : 'العميل'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 font-mono">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center gap-1 transition-colors"
                          title="تحميل المستند"
                        >
                          <Download className="w-3 h-3" />
                          <span>تحميل</span>
                        </button>

                        {(user?.role === 'ADMIN' || user?.role === 'STAFF' || doc.uploadedBy === user?.id || doc.uploadedBy === user?.userId) && (
                          <button
                            onClick={() => handleDelete(doc.id, doc.fileName)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};
