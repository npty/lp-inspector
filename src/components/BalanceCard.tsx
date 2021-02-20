import React from "react";
import { Balance, BalanceLP } from "../types";

interface BalanceCardProps {
  balance: Balance | BalanceLP;
}

function numberWithCommas(x: string) {
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function BalanceCard({ balance }: BalanceCardProps) {
  function renderBalance(balance: Balance) {
    const _tokenAmount = balance.token.amount
      .dividedBy(10 ** balance.token.decimals)
      .toFixed();
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
    console.log(balance)
    const _tokenAAmount = balance.tokenA.amount
      .dividedBy(10 ** balance.tokenA.decimals)
      .toFixed();
    const tokenAAmount = parseFloat(_tokenAAmount).toFixed(2);

    const _tokenBAmount = balance.tokenB.amount
      .dividedBy(10 ** balance.tokenB.decimals)
      .toFixed();
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
}

function instanceOfBalanceLP(data: any): data is BalanceLP {
  return "tokenA" in data;
}

export default BalanceCard;
