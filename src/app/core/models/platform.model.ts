export type PlatformType = 'B2C' | 'B2B' | 'B2C/B2B';
export type PlatformStatus = 'active' | 'ready' | 'configured';

export interface Platform {
  id: string;
  name: string;
  badge: PlatformType;
  filingFrequency: 'MONTHLY' | 'QUARTERLY';
  logoType: 'meesho' | 'flipkart' | 'amazon' | 'amazon-b2b' | 'myntra' | 'jiomart' | 'ajio' | 'nykaa' | 'tatacliq' | 'shopify';
  status: PlatformStatus;
  hasApiIntegration: boolean;
  tagline?: string;
  order: number;
}

export const PLATFORMS_DATA: Platform[] = [
  {
    id: 'meesho-b2c',
    name: 'Meesho',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'meesho',
    status: 'active',
    hasApiIntegration: true,
    tagline: 'Forward orders, returns & document series supported',
    order: 1,
  },
  {
    id: 'flipkart-b2c-b2b',
    name: 'Flipkart',
    badge: 'B2C/B2B',
    filingFrequency: 'MONTHLY',
    logoType: 'flipkart',
    status: 'active',
    hasApiIntegration: false,
    tagline: 'GSTR-1 sales and credit notes report',
    order: 2,
  },
  {
    id: 'amazon-b2c',
    name: 'Amazon',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'amazon',
    status: 'active',
    hasApiIntegration: false,
    tagline: 'MTR (Merchant Tax Report) B2C import',
    order: 3,
  },
  {
    id: 'amazon-b2b',
    name: 'Amazon',
    badge: 'B2B',
    filingFrequency: 'MONTHLY',
    logoType: 'amazon-b2b',
    status: 'active',
    hasApiIntegration: false,
    tagline: 'MTR B2B with verified buyer GSTINs',
    order: 4,
  },
  {
    id: 'myntra-b2c',
    name: 'Myntra',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'myntra',
    status: 'active',
    hasApiIntegration: false,
    tagline: 'Seller partner outward supply report',
    order: 5,
  },
  {
    id: 'jiomart-b2c',
    name: 'Jio Mart',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'jiomart',
    status: 'active',
    hasApiIntegration: false,
    tagline: 'Reliance Retail partner monthly tax report',
    order: 6,
  },
  {
    id: 'ajio-b2c',
    name: 'AJIO',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'ajio',
    status: 'configured',
    hasApiIntegration: false,
    tagline: 'Ajio marketplace sales & RTO summaries',
    order: 7,
  },
  {
    id: 'nykaa-b2c',
    name: 'Nykaa',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'nykaa',
    status: 'configured',
    hasApiIntegration: false,
    tagline: 'Beauty & Fashion seller GST statements',
    order: 8,
  },
  {
    id: 'tatacliq-b2c-b2b',
    name: 'Tata CLiQ',
    badge: 'B2C/B2B',
    filingFrequency: 'MONTHLY',
    logoType: 'tatacliq',
    status: 'ready',
    hasApiIntegration: false,
    tagline: 'Tata Unistore merchant tax reconciliation',
    order: 9,
  },
  {
    id: 'shopify-b2c',
    name: 'Shopify',
    badge: 'B2C',
    filingFrequency: 'MONTHLY',
    logoType: 'shopify',
    status: 'ready',
    hasApiIntegration: false,
    tagline: 'D2C brand outward supply aggregator',
    order: 10,
  },
];
