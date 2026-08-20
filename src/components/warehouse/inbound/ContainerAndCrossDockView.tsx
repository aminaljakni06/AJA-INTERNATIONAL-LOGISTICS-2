import React, { useState } from 'react';
import {
  Boxes,
  RefreshCw,
  CheckCircle2,
  Share2,
  Clock,
  Thermometer,
  ShieldAlert,
  ArrowRightLeft,
  Truck
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { InboundContainer, CrossDockRecord } from '../../../types/inboundWarehouse';

interface ContainerAndCrossDockViewProps {
  containers: InboundContainer[];
  crossDocks: CrossDockRecord[];
  onRefresh?: () => void;
}

export const ContainerAndCrossDockView: React.FC<ContainerAndCrossDockViewProps> = ({ containers, crossDocks, onRefresh }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h3 className="font-black text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-amber-600" />
          <span>{isAr ? 'إدارة الحاويات والشحن العابر المباشر (Container & Cross-Dock Hub)' : 'Container & Cross-Dock Hub'}</span>
        </h3>
        <p className="text-xs text-gray-500">
          {isAr ? 'تتبع فك الأختام الجمركية، تفريغ الحاوية المبردة، ونقل البضائع المباشر من رصيف الاستلام لـ Cross-Dock' : 'Customs seal verification, reefer container unload tracking & direct dock-to-dock cross-docking'}
        </p>
      </div>

      {/* TWO SECTIONS: CONTAINERS & CROSS-DOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CONTAINER UNLOAD TRACKER */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center justify-between">
            <span>{isAr ? 'حاويات الشحن قيد التفريغ (Inbound Containers)' : 'Inbound Containers'}</span>
            <span className="font-mono text-amber-600">{containers.length} Containers</span>
          </h4>

          <div className="space-y-3">
            {containers.map((cont) => (
              <div key={cont.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-amber-600 text-xs">{cont.containerNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {cont.containerType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">{isAr ? 'رقم الختم الجمركي:' : 'Seal Number:'}</span>
                    <strong className="font-mono text-gray-800 dark:text-gray-200">{cont.sealNumber}</strong>
                  </div>
                  {cont.temperatureCelsius && (
                    <div>
                      <span className="text-gray-400 text-[10px] block">{isAr ? 'حرارة التبريد:' : 'Reefer Temp:'}</span>
                      <strong className="text-cyan-600 font-bold">+{cont.temperatureCelsius}°C</strong>
                    </div>
                  )}
                </div>

                {/* UNLOAD PROGRESS */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>{isAr ? 'نسبة تفريغ الطبالي:' : 'Unload Progress:'}</span>
                    <span className="text-amber-600 font-mono">{cont.unloadedPallets} / {cont.expectedPallets} Pallets ({cont.unloadProgressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${cont.unloadProgressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CROSS DOCKING TRANSFER */}
        <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h4 className="font-bold text-xs text-indigo-600 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isAr ? 'التحويل المباشر بين الأرصفة (Cross-Dock Transfers)' : 'Cross-Dock Transfers'}</span>
            </span>
            <span className="font-mono">{crossDocks.length} Active</span>
          </h4>

          <div className="space-y-3">
            {crossDocks.map((xd) => (
              <div key={xd.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-950/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-indigo-600 text-xs">{xd.crossDockNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {xd.status}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100">{xd.productNameAr}</h5>
                  <p className="font-mono text-[11px] text-gray-500">{xd.skuCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono">
                  <div>
                    <span className="text-gray-400 block">{isAr ? 'من رصيف:' : 'From Dock:'}</span>
                    <strong className="text-amber-600">{xd.fromDockNumber}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{isAr ? 'إلى رصيف التصدير:' : 'To Outbound Bay:'}</span>
                    <strong className="text-emerald-600">{xd.toOutboundDockNumber}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>{isAr ? `شحنة التصدير: ${xd.outboundShipmentNumber}` : `Outbound: ${xd.outboundShipmentNumber}`}</span>
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{xd.transferQuantity} UNITS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerAndCrossDockView;
