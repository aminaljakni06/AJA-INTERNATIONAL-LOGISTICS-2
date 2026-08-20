import React, { useState, useEffect } from 'react';
import {
  Building2,
  Building,
  Layers,
  Boxes,
  Grid,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Thermometer,
  Maximize2,
  Database,
  Search,
  CheckCircle2,
  FolderTree
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  WarehouseLocation,
  WarehouseBuilding,
  WarehouseFloor,
  WarehouseZone,
  WarehouseAisle,
  WarehouseRack,
  WarehouseShelf,
  WarehouseBin
} from '../../../types/warehouse';
import { WarehouseClient } from '../../../services/warehouseClient';

export const WarehouseHierarchyView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);
  const [buildings, setBuildings] = useState<WarehouseBuilding[]>([]);
  const [floors, setFloors] = useState<WarehouseFloor[]>([]);
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [aisles, setAisles] = useState<WarehouseAisle[]>([]);
  const [racks, setRacks] = useState<WarehouseRack[]>([]);
  const [shelves, setShelves] = useState<WarehouseShelf[]>([]);
  const [bins, setBins] = useState<WarehouseBin[]>([]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const [whList, bldList, flrList, znList, aisList, rckList, shfList, binList] = await Promise.all([
        WarehouseClient.getWarehouses(),
        WarehouseClient.getWarehouseBuildings(),
        WarehouseClient.getWarehouseFloors(),
        WarehouseClient.getWarehouseZones(),
        WarehouseClient.getWarehouseAisles(),
        WarehouseClient.getWarehouseRacks(),
        WarehouseClient.getWarehouseShelves(),
        WarehouseClient.getWarehouseBins()
      ]);

      setWarehouses(whList);
      setBuildings(bldList);
      setFloors(flrList);
      setZones(znList);
      setAisles(aisList);
      setRacks(rckList);
      setShelves(shfList);
      setBins(binList);

      if (whList.length > 0) setSelectedWarehouseId(whList[0].id);
      if (znList.length > 0) setSelectedZoneId(znList[0].id);
    } catch (err) {
      console.error('Error loading warehouse hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedWh = warehouses.find(w => w.id === selectedWarehouseId);
  const filteredZones = zones.filter(z => z.warehouseId === selectedWarehouseId);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {isAr ? 'الهيكلية التخزينية المتقدمة (Multi-Level Warehouse Hierarchy)' : 'Enterprise Warehouse Hierarchy Tree'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'المستودع الرئيسي ← المبنى ← الطابق ← المنطقة ← الممر ← الرف ← الخانة' : 'Warehouse → Building → Floor → Zone → Aisle → Rack → Shelf → Bin Location'}
            </p>
          </div>
        </div>

        {/* WAREHOUSE SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">{isAr ? 'اختر المستودع:' : 'Select Warehouse:'}</span>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* HIERARCHICAL LEVEL OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: isAr ? 'المستودعات' : 'Warehouses', count: warehouses.length, icon: Building2, color: 'text-amber-600' },
          { label: isAr ? 'المباني' : 'Buildings', count: buildings.length, icon: Building, color: 'text-blue-600' },
          { label: isAr ? 'الطوابق' : 'Floors', count: floors.length, icon: Layers, color: 'text-purple-600' },
          { label: isAr ? 'المناطق' : 'Zones', count: zones.length, icon: Grid, color: 'text-emerald-600' },
          { label: isAr ? 'الممرات' : 'Aisles', count: aisles.length, icon: ChevronRight, color: 'text-cyan-600' },
          { label: isAr ? 'الأرفف Racks' : 'Racks', count: racks.length, icon: Boxes, color: 'text-orange-600' },
          { label: isAr ? 'الخانات Bins' : 'Bins', count: bins.length, icon: Database, color: 'text-indigo-600' },
        ].map((lvl, idx) => {
          const Icon = lvl.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1 text-center shadow-sm">
              <Icon className={`w-5 h-5 mx-auto ${lvl.color}`} />
              <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{lvl.count}</div>
              <div className="text-[10px] text-gray-500 font-bold">{lvl.label}</div>
            </div>
          );
        })}
      </div>

      {/* DETAILED HIERARCHY EXPLORER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT PANEL: TREE STRUCTURE */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
          <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>{isAr ? 'شجرة المستودع المحدد' : 'Selected Warehouse Tree'}</span>
          </h3>

          {selectedWh && (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                <span>{selectedWh.nameAr}</span>
                <span className="font-mono text-amber-600">{selectedWh.code}</span>
              </div>
              <p className="text-gray-500 text-[11px]">{selectedWh.city} • {selectedWh.addressAr}</p>
              <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-400">
                <span>السعة: {selectedWh.totalCapacityPallets.toLocaleString()} طبلية</span>
                <span>الإشغال: {selectedWh.utilizationPercent}%</span>
              </div>
            </div>
          )}

          {/* BUILDINGS & FLOORS */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{isAr ? 'المباني والطوابق المسجلة' : 'Buildings & Floors'}</h4>
            {buildings.filter(b => b.warehouseId === selectedWarehouseId).map(bld => (
              <div key={bld.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    {bld.buildingNameAr}
                  </span>
                  <span className="font-mono text-[10px] text-blue-600">{bld.buildingCode}</span>
                </div>
                <div className="pr-4 space-y-1 text-[11px] text-gray-500">
                  {floors.filter(f => f.buildingId === bld.id).map(flr => (
                    <div key={flr.id} className="flex items-center justify-between py-1 border-t border-gray-100 dark:border-gray-800">
                      <span>• {flr.floorNameAr}</span>
                      <span className="text-purple-600 font-bold">{flr.totalZones} مناطق</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: ZONES & AISLE DRILL-DOWN */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
          <div>
            <h3 className="font-black text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'المناطق والممرات والأرفف التفصيلية' : 'Zones & Aisle Layout'}</span>
            </h3>
            <p className="text-xs text-gray-500">{isAr ? 'استعراض حالة المناطق والتخزين داخل المستودع' : 'Explore zones, aisles and pallet shelf allocations'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredZones.map(zn => (
              <div
                key={zn.id}
                onClick={() => setSelectedZoneId(zn.id)}
                className={`p-5 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                  selectedZoneId === zn.id
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600">{zn.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {zn.zoneType}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{zn.nameAr}</h4>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>عدد الخانات (Bins):</span>
                    <strong>{zn.totalBinsCount} bin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>المشغولة:</span>
                    <strong className="text-amber-600">{zn.occupiedBinsCount} bin ({zn.utilizationPercent}%)</strong>
                  </div>
                </div>

                {/* VISUAL PROGRESS */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${zn.utilizationPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AISLES & RACKS MATRIX FOR SELECTED ZONE */}
          {selectedZoneId && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-orange-600" />
                <span>{isAr ? 'ممرات وأرفف المنطقة المختارة' : 'Aisles & Racks for Selected Zone'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {aisles.filter(a => a.zoneId === selectedZoneId).map(ais => (
                  <div key={ais.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-900 dark:text-gray-100">{ais.aisleNameAr}</span>
                      <span className="font-mono text-orange-600">{ais.aisleCode}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">إجمالي الأرفف (Racks): {ais.totalRacks} رف</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
