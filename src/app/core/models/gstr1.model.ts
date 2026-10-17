export interface B2csItem {
  sply_ty: 'INTER' | 'INTRA';
  rt: number;
  typ: string;
  pos: string;
  txval: number;
  iamt?: number;
  camt?: number;
  samt?: number;
  csamt?: number;
}

export interface HsnItem {
  num: number;
  hsn_sc: string;
  user_desc: string;
  uqc: string;
  qty: number;
  rt: number;
  txval: number;
  iamt?: number;
  camt?: number;
  samt?: number;
  csamt?: number;
}

export interface HsnContainer {
  hsn_b2c?: HsnItem[];
}

export interface SupecoItem {
  etin: string;
  suppval: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  cess?: number;
  flag: string;
}

export interface SupecoContainer {
  clttx?: SupecoItem[];
}

export interface DocItem {
  num: number;
  from: string;
  to: string;
  totnum: number;
  cancel: number;
  net_issue: number;
}

export interface DocDetItem {
  doc_num: number;
  doc_typ: string;
  docs: DocItem[];
}

export interface DocIssueContainer {
  doc_det?: DocDetItem[];
}

export interface Gstr1Payload {
  gstin: string;
  fp: string;
  version: string;
  hash: string;
  b2cs?: B2csItem[];
  hsn?: HsnContainer;
  supeco?: SupecoContainer;
  doc_issue?: DocIssueContainer;
}

export interface Gstr1Summary {
  totalTaxableValue: number;
  totalIgst: number;
  totalCgst: number;
  totalSgst: number;
  totalTax: number;
  totalInvoices: number;
  totalCancelled: number;
  netInvoices: number;
  posCount: number;
}
