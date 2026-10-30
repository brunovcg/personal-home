export const simplesTaxList = [
  'IRPJ',
  'CSLL',
  'Cofins',
  'PIS',
  'CPP',
  'ISS',
] as const;

export type SimplesTax = (typeof simplesTaxList)[number];

export interface SimplesBracket {
  limit: number;
  nominalRate: number;
  deduction: number;
  shares: Record<SimplesTax, number>;
}

export interface SimplesTaxLine {
  tax: SimplesTax;
  rate: number;
  domesticTax: number;
  // null when the tax is exempt on exports
  exportTax: number | null;
}

export interface SimplesResult {
  bracket: number;
  nominalRate: number;
  effectiveRate: number;
  exportRate: number;
  lines: SimplesTaxLine[];
  totalDomesticTax: number;
  totalExportTax: number;
}
