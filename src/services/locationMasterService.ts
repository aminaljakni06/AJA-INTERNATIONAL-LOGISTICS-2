import {
  CountryMaster,
  CityMaster,
  PortMaster,
  AirportMaster,
  WarehouseMaster,
  BorderCrossing,
  TradeLane,
  GeofenceZone,
  HolidayCalendarItem,
  LocationAnalytics
} from '../types/locationMaster';

// Initial Master Data Seeds for Global Logistics
const initialCountries: CountryMaster[] = [
  {
    id: 'cnt-sa',
    isoAlpha2: 'SA',
    isoAlpha3: 'SAU',
    numericCode: '682',
    arabicName: 'المملكة العربية السعودية',
    englishName: 'Saudi Arabia',
    currency: 'SAR',
    phoneCode: '+966',
    timeZone: 'Asia/Riyadh (UTC+3)',
    vatRatePercent: 15,
    taxRegistrationFormat: '300XXXXXXXXXXXX',
    sanctionStatus: 'CLEAR',
    tradeStatus: 'ACTIVE',
    primaryLanguages: ['Arabic', 'English'],
    flagEmoji: '🇸🇦',
    isGccMember: true
  },
  {
    id: 'cnt-ae',
    isoAlpha2: 'AE',
    isoAlpha3: 'ARE',
    numericCode: '784',
    arabicName: 'الإمارات العربية المتحدة',
    englishName: 'United Arab Emirates',
    currency: 'AED',
    phoneCode: '+971',
    timeZone: 'Asia/Dubai (UTC+4)',
    vatRatePercent: 5,
    taxRegistrationFormat: '100XXXXXXXXXXXX',
    sanctionStatus: 'CLEAR',
    tradeStatus: 'ACTIVE',
    primaryLanguages: ['Arabic', 'English'],
    flagEmoji: '🇦🇪',
    isGccMember: true
  },
  {
    id: 'cnt-cn',
    isoAlpha2: 'CN',
    isoAlpha3: 'CHN',
    numericCode: '156',
    arabicName: 'جمهورية الصين الشعبية',
    englishName: 'China',
    currency: 'CNY',
    phoneCode: '+86',
    timeZone: 'Asia/Shanghai (UTC+8)',
    vatRatePercent: 13,
    sanctionStatus: 'CLEAR',
    tradeStatus: 'ACTIVE',
    primaryLanguages: ['Mandarin', 'English'],
    flagEmoji: '🇨🇳',
    isGccMember: false
  },
  {
    id: 'cnt-us',
    isoAlpha2: 'US',
    isoAlpha3: 'USA',
    numericCode: '840',
    arabicName: 'الولايات المتحدة الأمريكية',
    englishName: 'United States',
    currency: 'USD',
    phoneCode: '+1',
    timeZone: 'America/New_York (UTC-5)',
    vatRatePercent: 0,
    sanctionStatus: 'CLEAR',
    tradeStatus: 'ACTIVE',
    primaryLanguages: ['English'],
    flagEmoji: '🇺🇸',
    isGccMember: false
  },
  {
    id: 'cnt-de',
    isoAlpha2: 'DE',
    isoAlpha3: 'DEU',
    numericCode: '276',
    arabicName: 'ألمانيا',
    englishName: 'Germany',
    currency: 'EUR',
    phoneCode: '+49',
    timeZone: 'Europe/Berlin (UTC+1)',
    vatRatePercent: 19,
    sanctionStatus: 'CLEAR',
    tradeStatus: 'ACTIVE',
    primaryLanguages: ['German', 'English'],
    flagEmoji: '🇩🇪',
    isGccMember: false
  }
];

const initialCities: CityMaster[] = [
  {
    id: 'ct-ruh',
    countryId: 'cnt-sa',
    countryCode: 'SA',
    cityNameEn: 'Riyadh',
    cityNameAr: 'الرياض',
    provinceRegion: 'Riyadh Region',
    district: 'King Abdullah Financial District',
    postalCode: '11564',
    latitude: 24.7136,
    longitude: 46.6753,
    elevationMeters: 612,
    populationEstimate: 7600000,
    deliveryCoverageStatus: 'FULL',
    isCommercialHub: true
  },
  {
    id: 'ct-jed',
    countryId: 'cnt-sa',
    countryCode: 'SA',
    cityNameEn: 'Jeddah',
    cityNameAr: 'جدة',
    provinceRegion: 'Makkah Region',
    district: 'Al-Balad',
    postalCode: '21421',
    latitude: 21.5433,
    longitude: 39.1728,
    elevationMeters: 12,
    populationEstimate: 4700000,
    deliveryCoverageStatus: 'FULL',
    isCommercialHub: true
  },
  {
    id: 'ct-dmm',
    countryId: 'cnt-sa',
    countryCode: 'SA',
    cityNameEn: 'Dammam',
    cityNameAr: 'الدمام',
    provinceRegion: 'Eastern Province',
    district: 'King Abdulaziz Port Zone',
    postalCode: '31411',
    latitude: 26.4207,
    longitude: 50.0888,
    elevationMeters: 10,
    populationEstimate: 1300000,
    deliveryCoverageStatus: 'FULL',
    isCommercialHub: true
  },
  {
    id: 'ct-dxb',
    countryId: 'cnt-ae',
    countryCode: 'AE',
    cityNameEn: 'Dubai',
    cityNameAr: 'دبي',
    provinceRegion: 'Dubai Emirate',
    district: 'Jebel Ali Free Zone',
    postalCode: '00000',
    latitude: 25.2048,
    longitude: 55.2708,
    elevationMeters: 5,
    populationEstimate: 3500000,
    deliveryCoverageStatus: 'FULL',
    isCommercialHub: true
  }
];

const initialPorts: PortMaster[] = [
  {
    id: 'prt-dmm',
    unLocode: 'SADMM',
    portNameEn: 'King Abdulaziz Port Dammam',
    portNameAr: 'ميناء الملك عبد العزيز بالدمام',
    portType: 'SEA_PORT',
    countryCode: 'SA',
    cityId: 'ct-dmm',
    latitude: 26.541,
    longitude: 50.185,
    annualTeuCapacity: 4000000,
    supportedCargoTypes: ['CONTAINER', 'HAZMAT', 'REEFER', 'RO_RO', 'BULK_LIQUID'],
    customsOfficeCode: 'SA-CUST-DMM',
    status: 'OPERATIONAL'
  },
  {
    id: 'prt-jed',
    unLocode: 'SAJED',
    portNameEn: 'Jeddah Islamic Port',
    portNameAr: 'ميناء جدة الإسلامي',
    portType: 'SEA_PORT',
    countryCode: 'SA',
    cityId: 'ct-jed',
    latitude: 21.48,
    longitude: 39.18,
    annualTeuCapacity: 7500000,
    supportedCargoTypes: ['CONTAINER', 'HAZMAT', 'REEFER', 'RO_RO'],
    customsOfficeCode: 'SA-CUST-JED',
    status: 'OPERATIONAL'
  },
  {
    id: 'prt-jafza',
    unLocode: 'AEJEA',
    portNameEn: 'Jebel Ali Port Dubai',
    portNameAr: 'ميناء جبل علي',
    portType: 'CONTAINER_TERMINAL',
    countryCode: 'AE',
    cityId: 'ct-dxb',
    latitude: 24.985,
    longitude: 55.068,
    annualTeuCapacity: 19300000,
    supportedCargoTypes: ['CONTAINER', 'HAZMAT', 'REEFER', 'BULK_LIQUID'],
    customsOfficeCode: 'AE-CUST-DXB',
    status: 'OPERATIONAL'
  }
];

const initialAirports: AirportMaster[] = [
  {
    id: 'apt-ruh',
    iataCode: 'RUH',
    icaoCode: 'OERK',
    airportNameEn: 'King Khalid International Airport',
    airportNameAr: 'مطار الملك خالد الدولي',
    airportType: 'INTERNATIONAL',
    countryCode: 'SA',
    cityName: 'Riyadh',
    latitude: 24.9576,
    longitude: 46.6988,
    cargoTerminalCapacityTonsPerYear: 600000,
    hasReeferColdChain: true,
    hasHazmatHub: true,
    status: 'OPERATIONAL'
  },
  {
    id: 'apt-jed',
    iataCode: 'JED',
    icaoCode: 'OEJN',
    airportNameEn: 'King Abdulaziz International Airport',
    airportNameAr: 'مطار الملك عبد العزيز الدولي',
    airportType: 'INTERNATIONAL',
    countryCode: 'SA',
    cityName: 'Jeddah',
    latitude: 21.6796,
    longitude: 39.1565,
    cargoTerminalCapacityTonsPerYear: 800000,
    hasReeferColdChain: true,
    hasHazmatHub: true,
    status: 'OPERATIONAL'
  },
  {
    id: 'apt-dxb',
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    airportNameEn: 'Dubai International Cargo MegaTerminal',
    airportNameAr: 'مطار دبي الدولي - قرية البضائع',
    airportType: 'CARGO_HUB',
    countryCode: 'AE',
    cityName: 'Dubai',
    latitude: 25.2532,
    longitude: 55.3657,
    cargoTerminalCapacityTonsPerYear: 2600000,
    hasReeferColdChain: true,
    hasHazmatHub: true,
    status: 'OPERATIONAL'
  }
];

const initialWarehouses: WarehouseMaster[] = [
  {
    id: 'wh-ruh-01',
    warehouseCode: 'WH-RUH-CENTRAL',
    warehouseNameEn: 'AJA Central Riyadh Mega Hub',
    warehouseNameAr: 'مركز أجا اللوجستي المركزي بالرياض',
    type: 'DISTRIBUTION_CENTER',
    organizationNodeId: 'org-ksa-hq',
    countryCode: 'SA',
    cityName: 'Riyadh',
    addressStreet: 'Exit 18, Southern Ring Road',
    latitude: 24.6214,
    longitude: 46.7821,
    totalCapacitySqm: 45000,
    storageZoneCount: 12,
    dockCount: 32,
    supportsHazmat: true,
    supportsTemperatureControlled: true,
    minTempCelsius: -20,
    maxTempCelsius: 25,
    workingHours: '24/7 Operational',
    status: 'ACTIVE'
  },
  {
    id: 'wh-jed-cold',
    warehouseCode: 'WH-JED-COLD',
    warehouseNameEn: 'AJA Jeddah Pharma & Cold Chain Facility',
    warehouseNameAr: 'مرفق أجا للتبريد والأدوية بجدة',
    type: 'COLD_STORAGE',
    organizationNodeId: 'org-ksa-hq',
    countryCode: 'SA',
    cityName: 'Jeddah',
    addressStreet: 'Industrial City 3, Port Corridor',
    latitude: 21.3912,
    longitude: 39.2411,
    totalCapacitySqm: 18000,
    storageZoneCount: 6,
    dockCount: 14,
    supportsHazmat: false,
    supportsTemperatureControlled: true,
    minTempCelsius: -25,
    maxTempCelsius: 8,
    workingHours: '24/7 Shift Basis',
    status: 'ACTIVE'
  }
];

const initialBorderCrossings: BorderCrossing[] = [
  {
    id: 'bc-batha',
    crossingCode: 'BC-SA-AE-BATHA',
    nameEn: 'Al Batha Border Port (SA / AE)',
    nameAr: 'منفذ البطحاء الحدودي',
    countryACode: 'SA',
    countryBCode: 'AE',
    customsOfficeName: 'Batha Customs Yard',
    borderType: 'LAND',
    operatingHours: '24 Hours',
    riskRating: 'LOW',
    avgCustomsClearanceHours: 3.5,
    status: 'OPEN'
  }
];

const initialTradeLanes: TradeLane[] = [
  {
    id: 'tl-cn-sa-sea',
    laneCode: 'TL-CN-SA-SEA',
    originCountryCode: 'CN',
    originHubName: 'Shanghai Port (CNSHA)',
    destinationCountryCode: 'SA',
    destinationHubName: 'Jeddah Islamic Port (SAJED)',
    mode: 'SEA',
    distanceKm: 11200,
    estimatedTransitDays: 21,
    preferredCarrierName: 'Maersk / COSCO',
    carbonScoreCo2PerTon: 180,
    riskLevel: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'tl-sa-ae-road',
    laneCode: 'TL-SA-AE-ROAD',
    originCountryCode: 'SA',
    originHubName: 'Riyadh Logistics Center',
    destinationCountryCode: 'AE',
    destinationHubName: 'Dubai JAFZA Hub',
    mode: 'ROAD',
    distanceKm: 1050,
    estimatedTransitDays: 2,
    preferredCarrierName: 'AJA Overland Fleet',
    carbonScoreCo2PerTon: 45,
    riskLevel: 'LOW',
    status: 'ACTIVE'
  }
];

const initialGeofences: GeofenceZone[] = [
  {
    id: 'gf-wh-ruh',
    zoneCode: 'GF-WH-RUH-01',
    zoneName: 'Riyadh Central Mega Hub Geofence Perimeter',
    type: 'CIRCLE',
    centerLat: 24.6214,
    centerLng: 46.7821,
    radiusMeters: 500,
    associatedLocationId: 'wh-ruh-01',
    entryAlertEnabled: true,
    exitAlertEnabled: true,
    speedLimitKmh: 15
  }
];

const initialHolidays: HolidayCalendarItem[] = [
  {
    id: 'hol-sa-founding',
    countryCode: 'SA',
    holidayNameEn: 'Saudi Founding Day',
    holidayNameAr: 'يوم التأسيس السعودي',
    date: '2026-02-22',
    type: 'NATIONAL',
    affectsCustoms: true,
    affectsPortOperations: false
  },
  {
    id: 'hol-sa-national',
    countryCode: 'SA',
    holidayNameEn: 'Saudi National Day',
    holidayNameAr: 'اليوم الوطني السعودي',
    date: '2026-09-23',
    type: 'NATIONAL',
    affectsCustoms: true,
    affectsPortOperations: false
  }
];

// In-Memory Data Store with fallback initialization
let countriesStore = [...initialCountries];
let citiesStore = [...initialCities];
let portsStore = [...initialPorts];
let airportsStore = [...initialAirports];
let warehousesStore = [...initialWarehouses];
let borderCrossingsStore = [...initialBorderCrossings];
let tradeLanesStore = [...initialTradeLanes];
let geofencesStore = [...initialGeofences];
let holidaysStore = [...initialHolidays];
let hydratedFromLocalStore = false;

function useLocalLocationStore(): boolean {
  return typeof window === 'undefined' && process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

async function getLocalDb() {
  if (!useLocalLocationStore()) return null;

  const modulePath = '../db/database';
  const { db } = await import(/* @vite-ignore */ modulePath);
  return db;
}

async function hydrateLocalLocationStore(): Promise<void> {
  if (!useLocalLocationStore() || hydratedFromLocalStore) return;

  const localDb = await getLocalDb();
  if (!localDb) return;

  const data = localDb.getRaw();
  data.location_master ||= {};
  const store = data.location_master;

  store.countries ||= initialCountries;
  store.cities ||= initialCities;
  store.ports ||= initialPorts;
  store.airports ||= initialAirports;
  store.warehouses ||= initialWarehouses;
  store.border_crossings ||= initialBorderCrossings;
  store.trade_lanes ||= initialTradeLanes;
  store.geofences ||= initialGeofences;
  store.holidays ||= initialHolidays;

  countriesStore = store.countries;
  citiesStore = store.cities;
  portsStore = store.ports;
  airportsStore = store.airports;
  warehousesStore = store.warehouses;
  borderCrossingsStore = store.border_crossings;
  tradeLanesStore = store.trade_lanes;
  geofencesStore = store.geofences;
  holidaysStore = store.holidays;

  localDb.save();
  hydratedFromLocalStore = true;
}

async function saveLocalLocationStore(): Promise<void> {
  if (!useLocalLocationStore()) return;

  const localDb = await getLocalDb();
  if (!localDb) return;

  const data = localDb.getRaw();
  data.location_master = {
    countries: countriesStore,
    cities: citiesStore,
    ports: portsStore,
    airports: airportsStore,
    warehouses: warehousesStore,
    border_crossings: borderCrossingsStore,
    trade_lanes: tradeLanesStore,
    geofences: geofencesStore,
    holidays: holidaysStore,
  };
  localDb.save();
}

export class LocationMasterService {
  // --- Analytics ---
  static async getAnalytics(): Promise<LocationAnalytics> {
    await hydrateLocalLocationStore();
    const totalWarehouseSqm = warehousesStore.reduce((acc, w) => acc + w.totalCapacitySqm, 0);
    const sanctioned = countriesStore.filter(c => c.sanctionStatus === 'SANCTIONED' || c.sanctionStatus === 'RESTRICTED').length;

    return {
      totalCountries: countriesStore.length,
      totalCities: citiesStore.length,
      totalPorts: portsStore.length,
      totalAirports: airportsStore.length,
      totalWarehouses: warehousesStore.length,
      totalTradeLanes: tradeLanesStore.length,
      totalWarehouseSqm,
      sanctionedCountriesCount: sanctioned
    };
  }

  // --- Countries ---
  static async getCountries(filter?: { search?: string; sanctionStatus?: string }): Promise<CountryMaster[]> {
    await hydrateLocalLocationStore();
    let result = [...countriesStore];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(c => 
        c.englishName.toLowerCase().includes(q) ||
        c.arabicName.includes(q) ||
        c.isoAlpha2.toLowerCase().includes(q) ||
        c.isoAlpha3.toLowerCase().includes(q)
      );
    }
    if (filter?.sanctionStatus) {
      result = result.filter(c => c.sanctionStatus === filter.sanctionStatus);
    }
    return result;
  }

  static async createCountry(data: Omit<CountryMaster, 'id'>, _userId: string): Promise<CountryMaster> {
    await hydrateLocalLocationStore();
    const id = `cnt-${data.isoAlpha2.toLowerCase()}`;
    const newCountry: CountryMaster = { ...data, id };
    countriesStore.push(newCountry);
    await saveLocalLocationStore();
    return newCountry;
  }

  static async updateCountry(id: string, data: Partial<CountryMaster>, _userId: string): Promise<CountryMaster> {
    await hydrateLocalLocationStore();
    const idx = countriesStore.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Country not found');
    countriesStore[idx] = { ...countriesStore[idx], ...data };
    await saveLocalLocationStore();
    return countriesStore[idx];
  }

  // --- Cities ---
  static async getCities(countryCode?: string): Promise<CityMaster[]> {
    await hydrateLocalLocationStore();
    if (countryCode) {
      return citiesStore.filter(c => c.countryCode === countryCode);
    }
    return citiesStore;
  }

  static async createCity(data: Omit<CityMaster, 'id'>, _userId: string): Promise<CityMaster> {
    await hydrateLocalLocationStore();
    const id = `ct-${Date.now().toString(36)}`;
    const newCity: CityMaster = { ...data, id };
    citiesStore.push(newCity);
    await saveLocalLocationStore();
    return newCity;
  }

  // --- Ports ---
  static async getPorts(countryCode?: string): Promise<PortMaster[]> {
    await hydrateLocalLocationStore();
    if (countryCode) {
      return portsStore.filter(p => p.countryCode === countryCode);
    }
    return portsStore;
  }

  static async createPort(data: Omit<PortMaster, 'id'>, _userId: string): Promise<PortMaster> {
    await hydrateLocalLocationStore();
    const id = `prt-${Date.now().toString(36)}`;
    const newPort: PortMaster = { ...data, id };
    portsStore.push(newPort);
    await saveLocalLocationStore();
    return newPort;
  }

  static async updatePort(id: string, data: Partial<PortMaster>, _userId: string): Promise<PortMaster> {
    await hydrateLocalLocationStore();
    const idx = portsStore.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Port not found');
    portsStore[idx] = { ...portsStore[idx], ...data };
    await saveLocalLocationStore();
    return portsStore[idx];
  }

  // --- Airports ---
  static async getAirports(countryCode?: string): Promise<AirportMaster[]> {
    await hydrateLocalLocationStore();
    if (countryCode) {
      return airportsStore.filter(a => a.countryCode === countryCode);
    }
    return airportsStore;
  }

  static async createAirport(data: Omit<AirportMaster, 'id'>, _userId: string): Promise<AirportMaster> {
    await hydrateLocalLocationStore();
    const id = `apt-${Date.now().toString(36)}`;
    const newAirport: AirportMaster = { ...data, id };
    airportsStore.push(newAirport);
    await saveLocalLocationStore();
    return newAirport;
  }

  static async updateAirport(id: string, data: Partial<AirportMaster>, _userId: string): Promise<AirportMaster> {
    await hydrateLocalLocationStore();
    const idx = airportsStore.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Airport not found');
    airportsStore[idx] = { ...airportsStore[idx], ...data };
    await saveLocalLocationStore();
    return airportsStore[idx];
  }

  // --- Warehouses ---
  static async getWarehouses(): Promise<WarehouseMaster[]> {
    await hydrateLocalLocationStore();
    return warehousesStore;
  }

  static async createWarehouse(data: Omit<WarehouseMaster, 'id'>, _userId: string): Promise<WarehouseMaster> {
    await hydrateLocalLocationStore();
    const id = `wh-${Date.now().toString(36)}`;
    const newWh: WarehouseMaster = { ...data, id };
    warehousesStore.push(newWh);
    await saveLocalLocationStore();
    return newWh;
  }

  static async updateWarehouse(id: string, data: Partial<WarehouseMaster>, _userId: string): Promise<WarehouseMaster> {
    await hydrateLocalLocationStore();
    const idx = warehousesStore.findIndex(w => w.id === id);
    if (idx === -1) throw new Error('Warehouse not found');
    warehousesStore[idx] = { ...warehousesStore[idx], ...data };
    await saveLocalLocationStore();
    return warehousesStore[idx];
  }

  // --- Border Crossings ---
  static async getBorderCrossings(): Promise<BorderCrossing[]> {
    await hydrateLocalLocationStore();
    return borderCrossingsStore;
  }

  // --- Trade Lanes ---
  static async getTradeLanes(): Promise<TradeLane[]> {
    await hydrateLocalLocationStore();
    return tradeLanesStore;
  }

  static async createTradeLane(data: Omit<TradeLane, 'id'>, _userId: string): Promise<TradeLane> {
    await hydrateLocalLocationStore();
    const id = `tl-${Date.now().toString(36)}`;
    const newTl: TradeLane = { ...data, id };
    tradeLanesStore.push(newTl);
    await saveLocalLocationStore();
    return newTl;
  }

  // --- Geofences ---
  static async getGeofences(): Promise<GeofenceZone[]> {
    await hydrateLocalLocationStore();
    return geofencesStore;
  }

  static async createGeofence(data: Omit<GeofenceZone, 'id'>, _userId: string): Promise<GeofenceZone> {
    await hydrateLocalLocationStore();
    const id = `gf-${Date.now().toString(36)}`;
    const newGf: GeofenceZone = { ...data, id };
    geofencesStore.push(newGf);
    await saveLocalLocationStore();
    return newGf;
  }

  // --- Holidays ---
  static async getHolidays(countryCode?: string): Promise<HolidayCalendarItem[]> {
    await hydrateLocalLocationStore();
    if (countryCode) {
      return holidaysStore.filter(h => h.countryCode === countryCode);
    }
    return holidaysStore;
  }
}
