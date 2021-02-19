import React from "react";
import { Balance, BalanceLP } from "../types";

interface BalanceCardProps {
  balance: Balance | BalanceLP;
}

function numberWithCommas(x: string) {
  return x.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function BalanceCard({ balance }: BalanceCardProps) {
  function renderBalance(balance: Balance) {
    const _tokenAmount = balance.token.amount.dividedBy(1e18).toFixed();
    const tokenAmount = parseFloat(_tokenAmount).toFixed(2);
    return (
      <div className="balance-card-container">
        <div className="balance-card-pair-name">{balance.token.name}</div>
        <div className="balance-card-pair-amount">
          {tokenAmount} {balance.token.name}
        </div>
        <div className="balance-card-pair-value">
          {numberWithCommas(balance.worth)} USD
        </div>
      </div>
    );
  }

  function renderBalanceLP(balance: BalanceLP) {
    const _tokenAAmount = balance.tokenA.amount.dividedBy(1e18).toFixed();
    const tokenAAmount = parseFloat(_tokenAAmount).toFixed(2);

    const _tokenBAmount = balance.tokenB.amount.dividedBy(1e18).toFixed();
    const tokenBAmount = parseFloat(_tokenBAmount).toFixed(2);
    return (
      <div className="balance-card-container">
        <div className="balance-card-pair-name">
          {balance.tokenA.name}/{balance.tokenB.name}
        </div>
        <div className="balance-card-pair-amount">
          {tokenAAmount} {balance.tokenA.name} / {tokenBAmount}{" "}
          {balance.tokenB.name}
        </div>
        <div className="balance-card-pair-value">
          {numberWithCommas(balance.worth)} USD
        </div>
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
