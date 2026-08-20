import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'جاري تحميل البيانات...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="w-10 h-10 border-4 border-[#0F4C75]/20 border-t-[#0F4C75] rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};
