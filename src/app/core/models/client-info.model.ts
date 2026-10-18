export interface ClientInfo {
  id?: string;
  company: string;
  client: string;
  gstin: string;
  period: string; // e.g. "September 2026"
  periodCode: string; // e.g. "092026"
  type?: string; // "Monthly" | "Quarterly"
  year: string; // "2026"
  sellerStateCode: string; // "09"
  username?: string;
}

export interface CompanyEntity {
  id: number;
  companyName: string;
  ownerName: string;
  gstin: string;
  isDefault?: boolean;
  default?: boolean;
  createdAt?: string;
}

export interface CompanyDto {
  companyName: string;
  ownerName: string;
  gstin: string;
}

export interface GstProfile {
  id: string;
  sNo: number;
  createdOn: string;
  companyName: string;
  ownerName: string;
  gstin: string;
  sellerStateCode: string;
  isDefault?: boolean;
  gstr1Status: 'Yes' | 'No';
  gstr3bStatus: 'Yes' | 'No';
  username?: string;
  password?: string;
  period: string;
  periodCode: string;
  year: string;
  month: string;
  history?: {
    aug26?: 'filed' | 'pending';
    sept26?: 'filed' | 'pending';
  };
}

export interface ConstantConfig {
  apiBaseUrl: string;
  currentFilingPeriod: string;
  filingDeadlineDaysLeft: number;
  maxProfilesAllowed: number;
  defaultStateCode: string;
  currencySymbol: string;
  taxRatesSupported: number[];
}

export const INITIAL_CONSTANT_CONFIG: ConstantConfig = {
  apiBaseUrl: 'http://localhost:8080/api/v1/gst/convert-meesho',
  currentFilingPeriod: '9/15',
  filingDeadlineDaysLeft: 6,
  maxProfilesAllowed: 10,
  defaultStateCode: '09',
  currencySymbol: '₹',
  taxRatesSupported: [0, 5, 12, 18, 28],
};

export const INITIAL_PROFILES: GstProfile[] = [
 
];

export const DEFAULT_CLIENT: ClientInfo = {
  company: 'dsdivine13',
  client: 'dsdivine13',
  gstin: '09OYVPS2177B2ZI',
  period: 'September 2026',
  periodCode: '092026',
  type: 'Monthly',
  year: '2026',
  sellerStateCode: '09',
};
