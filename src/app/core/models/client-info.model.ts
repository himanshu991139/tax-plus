export interface ClientInfo {
  id?: string;
  company: string;
  client: string;
  gstin: string;
  period: string; // e.g. "September 2026"
  periodCode: string; // e.g. "092026"
  type: string; // "Monthly" | "Quarterly"
  year: string; // "2026"
  sellerStateCode: string; // "09"
  username?: string;
}

export interface GstProfile {
  id: string;
  sNo: number;
  createdOn: string;
  companyName: string;
  ownerName: string;
  gstin: string;
  sellerStateCode: string;
  typeOfFiling: 'Monthly' | 'Quarterly';
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
  {
    id: 'p1',
    sNo: 1,
    createdOn: '16 Apr 2026',
    companyName: 'harsh',
    ownerName: 'harsh',
    gstin: '09OYVPS2177B1ZJ',
    sellerStateCode: '09',
    typeOfFiling: 'Monthly',
    gstr1Status: 'No',
    gstr3bStatus: 'No',
    username: 'harsh_seller',
    period: 'September 2026',
    periodCode: '092026',
    year: '2026',
    month: 'September',
    history: { aug26: 'pending', sept26: 'pending' },
  },
  {
    id: 'p2',
    sNo: 2,
    createdOn: '11 Apr 2026',
    companyName: 'dsdivine13',
    ownerName: 'dsdivine13',
    gstin: '09OYVPS2177B2ZI',
    sellerStateCode: '09',
    typeOfFiling: 'Monthly',
    gstr1Status: 'Yes',
    gstr3bStatus: 'No',
    username: 'dsdivine_gst',
    period: 'September 2026',
    periodCode: '092026',
    year: '2026',
    month: 'September',
    history: { aug26: 'pending', sept26: 'filed' },
  },
  {
    id: 'p3',
    sNo: 3,
    createdOn: '11 Apr 2026',
    companyName: 'xcleani',
    ownerName: 'xcleani',
    gstin: '09CDQPT2928D1Z3',
    sellerStateCode: '09',
    typeOfFiling: 'Monthly',
    gstr1Status: 'No',
    gstr3bStatus: 'No',
    username: 'xcleani_tax',
    period: 'September 2026',
    periodCode: '092026',
    year: '2026',
    month: 'September',
    history: { aug26: 'pending', sept26: 'pending' },
  },
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
