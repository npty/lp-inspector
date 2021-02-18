import React, { useState, useEffect } from "react";
import "../styles/BalanceDetails.css";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

const masterape = require("../abis/masterape.json");
const pair = require("../abis/pair.json");
const erc20 = require("../abis/erc20.json");

interface Balance {
  pool: number;
  balance: string;
  lpAddress: string;
  tokenA: Token;
  tokenB: Token;
}

interface Token {
  name: string;
  balance: BigNumber;
}

interface BalanceDetailsProps {
  contractAddress: string;
}

function BalanceDetails({ contractAddress }: BalanceDetailsProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const { account } = useWeb3React<Web3Provider>();

  useEffect(() => {
    async function queryContract() {
      console.log('contract', contractAddress)
      if (!account) return;
      if (!contractAddress) return;

      console.log('Loading...')

      const web3 = new Web3("https://bsc-dataseed.binance.org/");
      const contract = new web3.eth.Contract(masterape, contractAddress);
      const _poolLength = await contract.methods.poolLength().call();
      const _balances = [];
      for (let i = 0; i < parseInt(_poolLength); i++) {
        const { "0": balance } = await contract.methods
          .userInfo(i, account)
          .call();

        if (balance !== "0") {
          console.log("Found balance at pool:", i);
          console.log("Balance:", balance);
          _balances.push({ pool: i, balance });
        }
      }

      const _balancesLP = await Promise.all(
        _balances.map(async (b) => {
          const { "0": lpAddress } = await contract.methods
            .poolInfo(b.pool)
            .call();

          return { ...b, lpAddress };
        })
      );

      const _balanceLPPair = _balancesLP.map(async (lp) => {
        const contractLP = new web3.eth.Contract(pair, lp.lpAddress);
        const totalSupply = await contractLP.methods.totalSupply().call();
        const {
          "0": reserveA,
          "1": reserveB,
        } = await contractLP.methods.getReserves().call();
        const tokenABalance = new BigNumber(lp.balance)
          .dividedBy(totalSupply)
          .multipliedBy(reserveA);

        const tokenBBalance = new BigNumber(lp.balance)
          .dividedBy(totalSupply)
          .multipliedBy(reserveB);

        const tokenA = contractLP.methods
          .token0()
          .call()
          .then((address: string) => {
            const erc20Contract = new web3.eth.Contract(erc20, address);
            return erc20Contract.methods.symbol().call();
          });
        const tokenB = contractLP.methods
          .token1()
          .call()
          .then((address: string) => {
            const erc20Contract = new web3.eth.Contract(erc20, address);
            return erc20Contract.methods.symbol().call();
          });
        const [tokenASymbol, tokenBSymbol] = await Promise.all([
          tokenA,
          tokenB,
        ]);

        return {
          ...lp,
          tokenA: { name: tokenASymbol, balance: tokenABalance },
          tokenB: { name: tokenBSymbol, balance: tokenBBalance },
        };
      });

      const completeBalance = await Promise.all(_balanceLPPair);

      setBalances(completeBalance);
    }

    console.log(contractAddress)
    queryContract();
  }, [account, contractAddress]);

  const balanceDetails = balances.map((b) => (
    <p key={b.pool}>
      Pool [{b.tokenA.name}, {b.tokenB.name}]: [
      {b.tokenA.balance.dividedBy(1e18).integerValue().toFixed()},{" "}
      {b.tokenB.balance.dividedBy(1e18).integerValue().toFixed()}]
    </p>
  ));

  return (
    <div className="balance-details-container">
      {balanceDetails.length === 0 ? <p>Enter address...</p> : balanceDetails}
    </div>
  );
}

export default BalanceDetails;
