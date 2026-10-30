import {
  SimplesBracket,
  SimplesResult,
  SimplesTax,
  simplesTaxList,
} from './Simples.service.types';

const ISS_MAX_RATE = 0.05;

const EXPORT_EXEMPT_TAXES: SimplesTax[] = ['Cofins', 'PIS', 'ISS'];

// LC 123/2006, Anexo III
const BRACKETS: SimplesBracket[] = [
  {
    limit: 180000,
    nominalRate: 0.06,
    deduction: 0,
    shares: {
      IRPJ: 0.04,
      CSLL: 0.035,
      Cofins: 0.1282,
      PIS: 0.0278,
      CPP: 0.434,
      ISS: 0.335,
    },
  },
  {
    limit: 360000,
    nominalRate: 0.112,
    deduction: 9360,
    shares: {
      IRPJ: 0.04,
      CSLL: 0.035,
      Cofins: 0.1405,
      PIS: 0.0305,
      CPP: 0.434,
      ISS: 0.32,
    },
  },
  {
    limit: 720000,
    nominalRate: 0.135,
    deduction: 17640,
    shares: {
      IRPJ: 0.04,
      CSLL: 0.035,
      Cofins: 0.1364,
      PIS: 0.0296,
      CPP: 0.434,
      ISS: 0.325,
    },
  },
  {
    limit: 1800000,
    nominalRate: 0.16,
    deduction: 35640,
    shares: {
      IRPJ: 0.04,
      CSLL: 0.035,
      Cofins: 0.1364,
      PIS: 0.0296,
      CPP: 0.434,
      ISS: 0.325,
    },
  },
  {
    limit: 3600000,
    nominalRate: 0.21,
    deduction: 125640,
    shares: {
      IRPJ: 0.04,
      CSLL: 0.035,
      Cofins: 0.1282,
      PIS: 0.0278,
      CPP: 0.434,
      ISS: 0.335,
    },
  },
  {
    limit: 4800000,
    nominalRate: 0.33,
    deduction: 648000,
    shares: {
      IRPJ: 0.35,
      CSLL: 0.15,
      Cofins: 0.1603,
      PIS: 0.0347,
      CPP: 0.305,
      ISS: 0,
    },
  },
];

export class SimplesService {
  // Exports have their own limit, on top of the domestic one (LC 123, art. 3, §14)
  static readonly LIMIT = 4800000;

  private static getTaxRate(
    tax: SimplesTax,
    effectiveRate: number,
    shares: Record<SimplesTax, number>,
  ) {
    if (effectiveRate * shares.ISS <= ISS_MAX_RATE) {
      return effectiveRate * shares[tax];
    }
    // ISS is capped at 5%, the excess goes proportionally to the other taxes
    if (tax === 'ISS') return ISS_MAX_RATE;
    return ((effectiveRate - ISS_MAX_RATE) * shares[tax]) / (1 - shares.ISS);
  }

  static calculate(
    rbt12: number,
    domesticRevenue: number,
    exportRevenue: number,
  ): SimplesResult {
    const found = BRACKETS.findIndex((bracket) => rbt12 <= bracket.limit);
    const index = found === -1 ? BRACKETS.length - 1 : found;
    const { nominalRate, deduction, shares } = BRACKETS[index];

    const effectiveRate =
      rbt12 > 0 ? (rbt12 * nominalRate - deduction) / rbt12 : nominalRate;

    const lines = simplesTaxList.map((tax) => {
      const rate = this.getTaxRate(tax, effectiveRate, shares);
      return {
        tax,
        rate,
        domesticTax: domesticRevenue * rate,
        exportTax: EXPORT_EXEMPT_TAXES.includes(tax)
          ? null
          : exportRevenue * rate,
      };
    });

    return {
      bracket: index + 1,
      nominalRate,
      effectiveRate,
      exportRate: lines.reduce(
        (acc, line) => acc + (line.exportTax === null ? 0 : line.rate),
        0,
      ),
      lines,
      totalDomesticTax: domesticRevenue * effectiveRate,
      totalExportTax: lines.reduce(
        (acc, line) => acc + (line.exportTax ?? 0),
        0,
      ),
    };
  }
}
