import React, { useState, useEffect } from "react";
import "../styles/BalanceDetails.css";
import "../styles/BalanceCard.css";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import Exchange from "../utils/exchange";
import { BNB, BUSD } from "../utils/constants";
import { weiToEth } from "../utils/unit";
import { Balance, Token } from "../types";
import BalanceCard from "../components/BalanceCard";

const masterape = require("../abis/masterape.json");
const pair = require("../abis/pair.json");
const erc20 = require("../abis/erc20.json");

interface BalanceDetailsProps {
  contractAddress: string;
  routerContractAddress: string;
}

function BalanceDetails({
  contractAddress,
  routerContractAddress,
}: BalanceDetailsProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const { account } = useWeb3React<Web3Provider>();

  const exchange = new Exchange(routerContractAddress);

  useEffect(() => {
    async function queryContract() {
      if (!account) return;
      if (!contractAddress) return;

      const web3 = new Web3("https://bsc-dataseed.binance.org/");
      const contract = new web3.eth.Contract(masterape, contractAddress);
      const _poolLength = await contract.methods.poolLength().call();
      const _balances = [];
      for (let i = 0; i < parseInt(_poolLength); i++) {
        const { "0": balance } = await contract.methods
          .userInfo(i, account)
          .call();

        if (balance !== "0") {
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
        const tokenAmountA = new BigNumber(lp.balance)
          .dividedBy(totalSupply)
          .multipliedBy(reserveA);

        const tokenAmountB = new BigNumber(lp.balance)
          .dividedBy(totalSupply)
          .multipliedBy(reserveB);

        const tokenA = await contractLP.methods
          .token0()
          .call()
          .then((token: string) => token.toLowerCase());
        const tokenAContract = new web3.eth.Contract(erc20, tokenA);
        const tokenASymbol = await tokenAContract.methods.symbol().call();

        const tokenB = await contractLP.methods
          .token1()
          .call()
          .then((token: string) => token.toLowerCase());
        const tokenBContract = new web3.eth.Contract(erc20, tokenB);
        const tokenBSymbol = await tokenBContract.methods.symbol().call();

        let worth: string = "0";
        if (tokenA !== BUSD && tokenB !== BUSD) {
          const bnbAmount = tokenA === BNB ? tokenAmountA : tokenAmountB;
          const busdAmount = await exchange.getEquivalentToken(
            BNB,
            BUSD,
            bnbAmount.integerValue().toFixed()
          );
          const _worth = new BigNumber(2)
            .multipliedBy(busdAmount)
            .integerValue()
            .toFixed();
          worth = parseFloat(weiToEth(_worth)).toFixed(2);
        } else {
          const busdAmount = tokenA === BUSD ? tokenAmountA : tokenAmountB;
          const _worth = new BigNumber(2)
            .multipliedBy(busdAmount)
            .integerValue()
            .toFixed();
          worth = parseFloat(weiToEth(_worth)).toFixed(2);
        }

        return {
          ...lp,
          tokenA: { name: tokenASymbol, amount: tokenAmountA },
          tokenB: { name: tokenBSymbol, amount: tokenAmountB },
          worth,
        };
      });

      const completeBalance = await Promise.all(_balanceLPPair);

      setBalances(completeBalance);
    }
    queryContract();
  }, [account, contractAddress, exchange]);

  const balanceDetails = balances.map((b) => (
    <BalanceCard key={b.lpAddress} balance={b} />
  ));

  return (
    <div className="balance-details-container">
      <h2>Staking Details</h2>
      <div className="balance-details-content-container">
        {balanceDetails.length === 0 ? (
          <p className="balance-details-status">
            Fetching from staking pool...
          </p>
        ) : (
          balanceDetails
        )}
      </div>
    </div>
  );
}

export default BalanceDetails;
