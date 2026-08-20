import { User, Company } from '../types/user';
import { QuoteRequest } from '../types/quote';
import { Shipment, ShipmentEvent } from '../types/shipment';
import { ServiceInfo, FAQItem, SystemNotification, CustomerMessage } from '../types/cms';
import { AuditLog } from '../types/audit';
import { CMSContentDoc, CustomerProfileDoc } from '../types/firestore';
import type {
  IdentityProfile,
  LoginPolicy,
  MFAConfiguration,
  PasswordPolicy,
  RegisteredDeviceRecord,
  UserSessionRecord,
} from '../types/identity';
import type {
  AirportMaster,
  BorderCrossing,
  CityMaster,
  CountryMaster,
  GeofenceZone,
  HolidayCalendarItem,
  PortMaster,
  TradeLane,
  WarehouseMaster,
} from '../types/locationMaster';
import type {
  Customer360Profile,
  CustomerActivityTask,
  CustomerCommunicationEntry,
  CustomerDocument360,
  CustomerTimelineEntry,
} from '../types/customer360';
import type {
  AssetRecord,
  CommodityRecord,
  ContainerRecord,
  DigitalAssetRecord,
  DriverResourceRecord,
  EquipmentRecord,
  ProductMaster,
  ServiceItem,
  ServicePackage,
  ShipmentTypeDefinition,
  UomRecord,
  VehicleRecord,
} from '../types/productResourceMaster';

export interface Customer360Store {
  profiles?: Customer360Profile[];
  timelines?: CustomerTimelineEntry[];
  communications?: CustomerCommunicationEntry[];
  activities?: CustomerActivityTask[];
  documents?: CustomerDocument360[];
}

export interface LocationMasterStore {
  countries?: CountryMaster[];
  cities?: CityMaster[];
  ports?: PortMaster[];
  airports?: AirportMaster[];
  warehouses?: WarehouseMaster[];
  border_crossings?: BorderCrossing[];
  trade_lanes?: TradeLane[];
  geofences?: GeofenceZone[];
  holidays?: HolidayCalendarItem[];
}

export interface ProductResourceMasterStore {
  products?: ProductMaster[];
  services?: ServiceItem[];
  service_packages?: ServicePackage[];
  shipment_types?: ShipmentTypeDefinition[];
  vehicles?: VehicleRecord[];
  containers?: ContainerRecord[];
  equipment?: EquipmentRecord[];
  drivers?: DriverResourceRecord[];
  assets?: AssetRecord[];
  digital_assets?: DigitalAssetRecord[];
  uoms?: UomRecord[];
  commodities?: CommodityRecord[];
}

export interface IdentityPoliciesStore {
  password_policy?: PasswordPolicy;
  login_policy?: LoginPolicy;
}

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  customers?: CustomerProfileDoc[];
  quote_requests: QuoteRequest[];
  shipments: Shipment[];
  shipment_events: ShipmentEvent[];
  services: ServiceInfo[];
  faqs: FAQItem[];
  notifications: SystemNotification[];
  messages: CustomerMessage[];
  audit_logs: AuditLog[];
  cms_content?: CMSContentDoc[];
  location_master?: LocationMasterStore;
  product_resource_master?: ProductResourceMasterStore;
  customer_360?: Customer360Store;
  identity_profiles?: IdentityProfile[];
  user_sessions?: UserSessionRecord[];
  registered_devices?: RegisteredDeviceRecord[];
  mfa_configs?: MFAConfiguration[];
  identity_policies?: IdentityPoliciesStore;
}
