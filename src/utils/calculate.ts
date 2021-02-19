import React from "react";
import Web3 from "web3";
import { BalanceLP, Balance } from "../types";
import { calculate } from "./token";
const masterape = require("../abis/masterape.json");

export async function queryContract(
  routerContractAddress: string,
  callback: React.Dispatch<React.SetStateAction<(Balance | BalanceLP)[]>>,
  account?: string | null | undefined,
  contractAddress?: string
) {
  if (!account) return;
  if (!contractAddress) return;

  const provider = new Web3.providers.HttpProvider(
    "https://bsc-dataseed3.ninicoin.io/",
    {
      timeout: 120000,
    }
  );
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(masterape, contractAddress);
  const _poolLength = await contract.methods.poolLength().call();
  const _balances = [];
  for (let i = 0; i < parseInt(_poolLength); i++) {
    const { "0": balance } = await contract.methods.userInfo(i, account).call();

    if (balance !== "0") {
      _balances.push({ pool: i, balance });
    }
  }

  const _balancesLP = await Promise.all(
    _balances.map(async (b) => {
      const { "0": lpAddress } = await contract.methods.poolInfo(b.pool).call();

      return { ...b, lpAddress };
    })
  );

  const _balanceLPPair = _balancesLP.map(async (lp) => {
    return calculate(web3, lp, routerContractAddress);
  });

  const completeBalance = await Promise.all(_balanceLPPair);

  callback(completeBalance);
}
