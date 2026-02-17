import { useState, use } from 'react';
import './Salary.page.css';
import { CurrencyService } from '../../services/currency/Currency.service';
import { InputNumber } from '../../components/input-number/InputNumber';
import { Select } from '../../components/select/Select';
import {
  Currency,
  currencyList,
} from '../../services/currency/Currency.service.types';

const currencyPromise = CurrencyService.getBRLPromise();

export function SalaryPage() {
  const res = use(currencyPromise);

  const calculate = (value: number, currencyValue: number) =>
    parseFloat((value / currencyValue).toFixed(2));

  const [rates, setRates] = useState(() => {
    const initialRates: Record<string, number> = {};
    currencyList.forEach((currency) => {
      const apiRate = res.conversion_rates[currency as keyof typeof res.conversion_rates] || 1;
      initialRates[currency] = calculate(1, apiRate);
    });
    return initialRates;
  });

  const [companies, setCompanies] = useState([
    { company: 'IM', value: 5500, currency: 'USD' },
    { company: 'TE', value: 4580, currency: 'USD' },
  ]);

  const addCompany = () => {
    setCompanies((prev) => [...prev, { company: '', value: 0, currency: 'USD' }]);
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

  const updateCompany = (index: number, field: string, value: string | number) => {
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
                      step="0.01"
                      value={rates[currency]}
                      onChange={(e) => updateRate(currency, Number(e.target.value))}
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
                Empresa
              </th>
              <th className="bg-salary__header bg-salary__header-value">
                Valor
              </th>
              <th className="bg-salary__header bg-salary__header-currency">
                Moeda
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
                <tr key={`${item.company}-row`}>
                  {/* Company */}
                  <td
                    className={`bg-salary__cell bg-salary__${item.company}-company`}
                    data-label="Empresa"
                  >
                     <input
                       className="company-input"
                       value={item.company}
                       onChange={(e) => updateCompany(index, 'company', e.target.value)}
                     />
                  </td>

                   {/* Value */}
                   <td 
                    className={`bg-salary__cell bg-salary__${item.company}-value`}
                    data-label="Valor"
                   >
                    <InputNumber
                      className="value-input"
                      value={item.value}
                      onChange={(e) => updateCompany(index, 'value', Number(e.target.value))}
                    />
                   </td>

                   {/* Currency */}
                   <td 
                    className={`bg-salary__cell bg-salary__${item.company}-currency`}
                    data-label="Moeda"
                   >
                 
                    <Select
                      value={item.currency}
                      onChange={(e) => updateCompany(index, 'currency', e.target.value)}
                      options={displayedCurrencies}
                    />
                 
                   </td>

                   {/* Rate */}
                   <td 
                    className={`bg-salary__cell bg-salary__${item.company}-rating`}
                    data-label="Rate"
                   >
                     {rate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                     <button className="remove-btn" onClick={() => removeCompany(index)}>✕</button>
                   </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
             <tr>
               <td colSpan={4} className="bg-salary__cell bg-salary-total">Total BRL</td>
               <td></td>
               <td className="bg-salary__cell bg-salary-total-value">
                  {totalReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
               </td>
             </tr>
          </tfoot>
        </table>
        <button className="add-btn" onClick={addCompany}>+ Add</button>
      </div>
    </div>
  );
}
