import React, { useState, useEffect, useMemo } from "react";
import "../styles/BalanceDetails.css";
import "../styles/BalanceCard.css";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import Exchange from "../utils/exchange";
import { BNB, BUSD } from "../utils/constants";
import { weiToEth } from "../utils/unit";
import { Balance } from "../types";
import BalanceCard from "../components/BalanceCard";
import Error from "../components/Error";

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
  const [fetching, setFetching] = useState<boolean>(false);
  const [invalidContract, setInvalidContract] = useState(false);
  const { account } = useWeb3React<Web3Provider>();
  const exchange = useMemo<Exchange>(
    () => new Exchange(routerContractAddress),
    [routerContractAddress]
  );

  useEffect(() => {
    async function queryContract() {
      if (!account) return;
      if (!contractAddress) return;

      const web3 = new Web3('https://bsc-dataseed3.ninicoin.io/');
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

    setFetching(true);
    queryContract()
      .catch((e) => {
        setInvalidContract(true);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [account, contractAddress, exchange]);

  const balanceDetails = balances.map((b) => (
    <BalanceCard key={b.lpAddress} balance={b} />
  ));

  function renderOrError() {
    if (invalidContract) {
      return <Error>Invalid Contract</Error>;
    } else if (fetching) {
      return (
        <p className="balance-details-status">Fetching from staking pool...</p>
      );
    } else if (balanceDetails.length === 0) {
      return (
        <p className="balance-details-status">There're no LPs in the given staking contract.</p>
      );
    } else {
      return balanceDetails;
    }
  }

  return (
    <div className="balance-details-container">
      <h2>Staking Details</h2>
      <div className="balance-details-content-container">{renderOrError()}</div>
    </div>
  );
}

export default BalanceDetails;
