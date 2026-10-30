import { useState, use } from 'react';
import './Salary.page.css';
import { CurrencyService } from '../../services/currency/Currency.service';
import { SimplesService } from '../../services/simples/Simples.service';
import { InputNumber } from '../../components/input-number/InputNumber';
import { Select } from '../../components/select/Select';
import {
  Currency,
  currencyList,
} from '../../services/currency/Currency.service.types';

const currencyPromise = CurrencyService.getBRLPromise();

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatUSD = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' });

const formatPercent = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function SalaryPage() {
  const res = use(currencyPromise);

  const calculate = (value: number, currencyValue: number) =>
    parseFloat((value / currencyValue).toFixed(2));

  const [rates, setRates] = useState(() => {
    const initialRates: Record<string, number> = {};
    currencyList.forEach((currency) => {
      const apiRate =
        res.conversion_rates[currency as keyof typeof res.conversion_rates] ||
        1;
      initialRates[currency] = calculate(1, apiRate);
    });
    return initialRates;
  });

  const [companies, setCompanies] = useState([
    { id: 1, company: 'IM', value: 5500, currency: 'USD' },
    { id: 2, company: 'TE', value: 4580, currency: 'USD' },
    { id: 3, company: 'VT', value: 0, currency: 'USD' },
  ]);

  // null follows the monthly total × 12 until the user types a value
  const [domesticRbt12, setDomesticRbt12] = useState<number | null>(null);
  const [exportRbt12, setExportRbt12] = useState<number | null>(null);

  const addCompany = () => {
    setCompanies((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        company: '',
        value: 0,
        currency: 'USD',
      },
    ]);
  };

  const removeCompany = (index: number) => {
    setCompanies((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRate = (currency: string, newRate: number) => {
    setRates((prev) => ({
      ...prev,
      [currency]: newRate,
    }));
  };

  const updateCompany = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setCompanies((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const displayedCurrencies: Currency[] = ['USD', 'EUR', 'BRL'];

  // Calculate total
  const totalReal = companies.reduce((acc, company) => {
    const rate = rates[company.currency] || 0;
    const realValue = company.value * rate;
    return acc + realValue;
  }, 0);

  // Anything not billed in BRL counts as export
  const exportRevenue = companies.reduce((acc, company) => {
    if (company.currency === 'BRL') return acc;
    return acc + company.value * (rates[company.currency] || 0);
  }, 0);
  const domesticRevenue = totalReal - exportRevenue;

  const domesticAnnual = domesticRbt12 ?? Math.round(domesticRevenue * 12);
  const exportAnnual = exportRbt12 ?? Math.round(exportRevenue * 12);

  const simples = SimplesService.calculate(
    domesticAnnual + exportAnnual,
    domesticRevenue,
    exportRevenue,
  );
  const totalTax = simples.totalDomesticTax + simples.totalExportTax;

  const limitUsage = [
    { label: 'Domestic', revenue: domesticAnnual },
    { label: 'Export', revenue: exportAnnual },
  ];

  return (
    <div className="bg-salary">
      <div className="bg-salary__rates-table">
        <h3>Currency Rates (to BRL)</h3>
        <table>
          <thead>
            <tr>
              <th>Currency</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {displayedCurrencies.map((currency) => (
              <tr key={currency}>
                <td>{currency}</td>
                <td>
                  {currency === 'BRL' ? (
                    '1'
                  ) : (
                    <InputNumber
                      className="rate-input"
                      value={rates[currency]}
                      onChange={(value) => updateRate(currency, value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-salary__container">
        <table className="bg-salary__company-table">
          <thead>
            <tr>
              <th className="bg-salary__header bg-salary__header-company">
                Unit
              </th>
              <th className="bg-salary__header bg-salary__header-value">
                Amount
              </th>
              <th className="bg-salary__header bg-salary__header-currency">
                Currency
              </th>
              <th className="bg-salary__header bg-salary__header-rating">
                Rate
              </th>
              <th className="bg-salary__header bg-salary__header-real">Real</th>
              <th className="bg-salary__header"></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((item, index) => {
              const rate = rates[item.currency] || 0;
              const realValue = item.value * rate;

              return (
                <tr key={item.id}>
                  {/* Company */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-company`}
                    data-label="Unit"
                  >
                    <input
                      className="company-input"
                      value={item.company}
                      onChange={(e) =>
                        updateCompany(index, 'company', e.target.value)
                      }
                    />
                  </td>

                  {/* Value */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-value`}
                    data-label="Amount"
                  >
                    <InputNumber
                      className="value-input"
                      value={item.value}
                      onChange={(value) => updateCompany(index, 'value', value)}
                    />
                  </td>

                  {/* Currency */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-currency`}
                    data-label="Currency"
                  >
                    <Select
                      value={item.currency}
                      onChange={(e) =>
                        updateCompany(index, 'currency', e.target.value)
                      }
                      options={displayedCurrencies}
                    />
                  </td>

                  {/* Rate */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-rating`}
                    data-label="Rate"
                  >
                    {rate.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Real */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-real`}
                    data-label="Real"
                  >
                    {realValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>

                  {/* Remove */}
                  <td className="bg-salary__cell">
                    <button
                      className="remove-btn"
                      onClick={() => removeCompany(index)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="bg-salary__cell bg-salary-total">
                Total REAL
              </td>
              <td className="bg-salary__cell bg-salary-total-value">
                {totalReal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
            </tr>
          </tfoot>
        </table>
        <button className="add-btn" onClick={addCompany}>
          + Add
        </button>
      </div>

      <div className="bg-salary__simples">
        <h3>Simples Nacional Taxes (Annex III)</h3>
        <div className="bg-salary__simples-fields">
          <label>
            12-month domestic revenue
            <InputNumber value={domesticAnnual} onChange={setDomesticRbt12} />
          </label>
          <label>
            12-month export revenue
            <InputNumber value={exportAnnual} onChange={setExportRbt12} />
          </label>
        </div>
        <dl className="bg-salary__simples-summary">
          <div>
            <dt>Bracket</dt>
            <dd>
              {simples.bracket} ({formatPercent(simples.nominalRate)})
            </dd>
          </div>
          <div>
            <dt>Effective rate</dt>
            <dd>{formatPercent(simples.effectiveRate)}</dd>
          </div>
          <div>
            <dt>Export rate</dt>
            <dd>{formatPercent(simples.exportRate)}</dd>
          </div>
        </dl>
        <table>
          <thead>
            <tr>
              <th>Tax</th>
              <th>Rate</th>
              <th>Domestic</th>
              <th>Export</th>
            </tr>
          </thead>
          <tbody>
            {simples.lines.map((line) => (
              <tr key={line.tax}>
                <td>{line.tax}</td>
                <td>{formatPercent(line.rate)}</td>
                <td>{formatBRL(line.domesticTax)}</td>
                <td>
                  {line.exportTax === null
                    ? 'Exempt'
                    : formatBRL(line.exportTax)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Monthly taxes</td>
              <td>{formatBRL(simples.totalDomesticTax)}</td>
              <td>{formatBRL(simples.totalExportTax)}</td>
            </tr>
            <tr className="bg-salary__simples-net">
              <td colSpan={2}>Net after {formatBRL(totalTax)} in taxes</td>
              <td colSpan={2}>{formatBRL(totalReal - totalTax)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-salary__simples">
        <h3>Simples Limit ({formatBRL(SimplesService.LIMIT)} per market)</h3>
        {limitUsage.map(({ label, revenue }) => {
          const usage = revenue / SimplesService.LIMIT;
          const exceeded = usage > 1;
          const difference = Math.abs(SimplesService.LIMIT - revenue);
          const amount =
            rates.USD > 0
              ? `${formatBRL(difference)} (${formatUSD(difference / rates.USD)})`
              : formatBRL(difference);

          return (
            <div className="bg-salary__limit" key={label}>
              <div className="bg-salary__limit-header">
                <span>{label}</span>
                <span>{formatPercent(usage)}</span>
              </div>
              <div className="bg-salary__limit-track">
                <div
                  className={`bg-salary__limit-bar ${exceeded ? 'bg-salary__limit-bar--exceeded' : ''}`}
                  style={{ width: `${Math.min(usage, 1) * 100}%` }}
                />
              </div>
              <p className={exceeded ? 'bg-salary__limit--exceeded' : ''}>
                {exceeded ? `Exceeded by ${amount}` : `${amount} left`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
