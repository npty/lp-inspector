import React from "react";
import { Balance, BalanceLP } from "../types";

interface BalanceTotalProps {
  balances: (Balance | BalanceLP)[];
}

function numberWithCommas(x: string|number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function BalanceTotal({ balances }: BalanceTotalProps) {
  const calculate = (balances: (Balance | BalanceLP)[]) => {
    return balances.reduce(
      (acc: number, balance: Balance | BalanceLP) =>
        parseFloat(balance.worth) + acc,
      0
    );
  };

  return (
    <div className="balance-total-container">
      <div className="balance-total-title">Total worth</div>
      <div className="balance-total-value">
        {numberWithCommas(parseFloat(calculate(balances).toFixed(2)))} USD
      </div>
    </div>
  );
}

export default BalanceTotal;
