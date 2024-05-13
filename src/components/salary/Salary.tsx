import { useEffect, useState } from "react";
import "./Salary.scss";
import Currency from "../../services/currency/Currency";

export default function Salary() {
  const [data, setData] = useState([
    { company: "IM", value: 5500, currency: "USD", rating: 0, real: 0 },
    { company: "MA", value: 1900, currency: "EUR", rating: 0, real: 0 },
    { company: "RL", value: 21000, currency: "BRL", rating: 0, real: 0 },
  ]);

  const calculate = (value: number, currencyValue: number) =>
    parseFloat((value / currencyValue).toFixed(2));

  useEffect(() => {
    Currency.getBRL()
      .then((res) => res.json())
      .then((res) =>
        setData((state) =>
          state.map((cur) => {
            const rating = calculate(1, res.conversion_rates[cur.currency]);

            return {
              ...cur,
              rating,
              real: rating * cur.value,
            };
          })
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
        <div className="bg-salary__header bg-salary__header-rating">Rate</div>
        <div className="bg-salary__header bg-salary__header-real">Real</div>
        {data.map((item) => {
          const entries = Object.entries(item);

          return entries.map(([key, value]) => (
            <div
              key={`${item.company}-${key}`}
              className={`bg-salary__cell bg-salary__${item.company}-${key}`}
            >
              {key === "real" ? (
                (item.rating * item.value).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              ) : key === "rating" ? (
                <input
                  className="rating-input"
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    setData((state) =>
                      state.map((st) =>
                        st.company === item.company
                          ? {
                              ...st,
                              real: Number(event.target.value) * item.value,
                              rating: Number(event.target.value),
                            }
                          : { ...st }
                      )
                    )
                  }
                />
              ) : key === "value" ? (
                <input
                  className="value-input"
                  type="number"
                  value={value}
                  onChange={(event) =>
                    setData((state) =>
                      state.map((st) =>
                        st.company === item.company
                          ? {
                              ...st,
                              real: item.rating * Number(event.target.value),
                              value: Number(event.target.value),
                            }
                          : { ...st }
                      )
                    )
                  }
                />
              ) : (
                value
              )}
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
