import { environment } from '../../../environments/environment';

export type FilingFrequencyType = 'Monthly' | 'Quarterly';

export interface QuarterOption {
  value: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  label: string;
  months: string;
  endMonthCode: string;
}

export const FILING_QUARTERS: QuarterOption[] = [
  { value: 'Q1', label: 'Q1 (April - June)', months: 'Apr, May, Jun', endMonthCode: '06' },
  { value: 'Q2', label: 'Q2 (July - September)', months: 'Jul, Aug, Sep', endMonthCode: '09' },
  { value: 'Q3', label: 'Q3 (October - December)', months: 'Oct, Nov, Dec', endMonthCode: '12' },
  { value: 'Q4', label: 'Q4 (January - March)', months: 'Jan, Feb, Mar', endMonthCode: '03' },
];

export interface QuarterMonthInfo {
  monthName: string; // "July"
  monthCode: string; // "07"
  year: string;      // "2026"
  periodCode: string;// "072026"
}

export function getQuarterMonths(quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', financialYear: string): QuarterMonthInfo[] {
  const startYear = parseInt((financialYear || '2026').substring(0, 4), 10) || 2026;
  const nextYear = startYear + 1;

  switch (quarter) {
    case 'Q1':
      return [
        { monthName: 'April', monthCode: '04', year: String(startYear), periodCode: `04${startYear}` },
        { monthName: 'May', monthCode: '05', year: String(startYear), periodCode: `05${startYear}` },
        { monthName: 'June', monthCode: '06', year: String(startYear), periodCode: `06${startYear}` },
      ];
    case 'Q2':
      return [
        { monthName: 'July', monthCode: '07', year: String(startYear), periodCode: `07${startYear}` },
        { monthName: 'August', monthCode: '08', year: String(startYear), periodCode: `08${startYear}` },
        { monthName: 'September', monthCode: '09', year: String(startYear), periodCode: `09${startYear}` },
      ];
    case 'Q3':
      return [
        { monthName: 'October', monthCode: '10', year: String(startYear), periodCode: `10${startYear}` },
        { monthName: 'November', monthCode: '11', year: String(startYear), periodCode: `11${startYear}` },
        { monthName: 'December', monthCode: '12', year: String(startYear), periodCode: `12${startYear}` },
      ];
    case 'Q4':
      return [
        { monthName: 'January', monthCode: '01', year: String(nextYear), periodCode: `01${nextYear}` },
        { monthName: 'February', monthCode: '02', year: String(nextYear), periodCode: `02${nextYear}` },
        { monthName: 'March', monthCode: '03', year: String(nextYear), periodCode: `03${nextYear}` },
      ];
  }
}

export const FINANCIAL_YEARS: string[] = [
  '2026-2027',
  '2025-2026',
  '2024-2025',
  '2023-2024',
];

export interface ClientInfo {
  id?: string;
  company: string;
  client: string;
  gstin: string;
  period: string; // e.g. "September 2026" or "Q2 (Jul - Sep) FY 2026-27"
  periodCode: string; // e.g. "092026"
  filingType?: FilingFrequencyType; // "Monthly" | "Quarterly"
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  financialYear?: string; // "2026-2027"
  type?: string; // "Monthly" | "Quarterly"
  year: string; // "2026"
  sellerStateCode: string; // "09"
  username?: string;
}

export interface CompanyEntity {
  id: number;
  companyName: string;
  gstin: string;
  isDefault?: boolean;
  default?: boolean;
  createdAt?: string;
}

export interface CompanyDto {
  companyName: string;
  gstin: string;
}

export interface GstProfile {
  id: string;
  sNo: number;
  createdOn: string;
  companyName: string;
  gstin: string;
  sellerStateCode: string;
  isDefault?: boolean;
  gstr1Status: 'Yes' | 'No';
  gstr3bStatus: 'Yes' | 'No';
  username?: string;
  password?: string;
  period: string;
  periodCode: string;
  filingType?: FilingFrequencyType;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  financialYear?: string;
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
  apiBaseUrl: environment.gstConvertEndpoint,
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
