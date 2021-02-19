import React from "react";
import { Balance, BalanceLP } from "../types";

interface BalanceCardProps {
  balance: Balance | BalanceLP;
}

function BalanceCard({ balance }: BalanceCardProps) {
  function renderBalance(balance: Balance) {
    const _tokenAmount = balance.token.amount.dividedBy(1e18).toFixed()
    const tokenAmount = parseFloat(_tokenAmount).toFixed(2)
    return (
      <div className="balance-card-container">
        <div className="balance-card-pair-name">{balance.token.name}</div>
        <div className="balance-card-pair-amount">
          {tokenAmount}{" "}
          {balance.token.name}
        </div>
        <div className="balance-card-pair-value">{balance.worth} USD</div>
      </div>
    );
  }

  function renderBalanceLP(balance: BalanceLP) {
    return (
      <div className="balance-card-container">
        <div className="balance-card-pair-name">
          {balance.tokenA.name}/{balance.tokenB.name}
        </div>
        <div className="balance-card-pair-amount">
          {balance.tokenA.amount.dividedBy(1e18).toFixed()}{" "}
          {balance.tokenA.name} /{" "}
          {balance.tokenB.amount.dividedBy(1e18).toFixed()}{" "}
          {balance.tokenB.name}
        </div>
        <div className="balance-card-pair-value">{balance.worth} USD</div>
      </div>
    );
  }

  if (instanceOfBalanceLP(balance)) {
    return renderBalanceLP(balance);
  } else {
    return renderBalance(balance);
  }

  // return { balance is Balance ?
  // }
}

function instanceOfBalanceLP(data: any): data is BalanceLP {
  return "tokenA" in data;
}

export default BalanceCard;
