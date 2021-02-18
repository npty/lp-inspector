import React from "react";
import { Balance } from "../types";

interface BalanceCardProps {
  balance: Balance;
}

function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="balance-card-container">
      <div className="balance-card-pair-name">
        {balance.tokenA.name}/{balance.tokenB.name}
      </div>
      <div className="balance-card-pair-amount">
        {balance.tokenA.amount.dividedBy(1e18).integerValue().toFixed()}{" "}
        {balance.tokenA.name} /{" "}
        {balance.tokenB.amount.dividedBy(1e18).integerValue().toFixed()}{" "}
        {balance.tokenB.name}
      </div>
      <div className="balance-card-pair-value">{balance.worth} USD</div>
    </div>
  );
}

export default BalanceCard;
