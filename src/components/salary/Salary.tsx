import { useEffect, useState } from "react";
import "./Salary.scss";
import Currency from "../../services/currency/Currency";

export default function Salary() {
  const [data, setData] = useState([
    { company: "Investor", value: 5500, currency: "USD", real: 0 },
    { company: "Mate", value: 1900, currency: "EUR", real: 0 },
  ]);

  useEffect(() => {
    Currency.getBRL()
      .then((res) => res.json())
      .then((res) =>
        setData((state) =>
          state.map((cur) => ({
            ...cur,
            real: parseFloat(
              (cur.value / res.conversion_rates[cur.currency]).toFixed(2)
            ),
          }))
        )
      );
  }, []);

  return (
    <div className="bg-salary">
      <div className="bg-salary__container">
        <div className="bg-salary__header bg-salary__header-company">
          Empresa
        </div>
        <div className="bg-salary__header bg-salary__header-value">Valor</div>
        <div className="bg-salary__header bg-salary__header-currency">
          Moeda
        </div>
        <div className="bg-salary__header bg-salary__header-real">Real</div>
        {data.map((item) => {
          const entries = Object.entries(item);

          return entries.map(([key, value]) => (
            <div
              key={`${item.company}-${key}`}
              className={`bg-salary__cell bg-salary__${item.company}-${key}`}
            >
              {key === "real"
                ? value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : value}
            </div>
          ));
        })}

        <div className="bg-salary__cell bg-salary-total">Total BRL</div>
        <div className="bg-salary__cell bg-salary-total-value">
          {data
            .reduce((acc, current) => acc + current.real, 0)
            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
      </div>
    </div>
  );
}
