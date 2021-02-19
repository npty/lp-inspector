import React, { useState, useEffect, useMemo } from "react";
import "../styles/BalanceDetails.css";
import "../styles/BalanceCard.css";
import "../styles/BalanceTotal.css";
import Web3 from "web3";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import Exchange from "../utils/exchange";
import { BalanceLP, Balance } from "../types";
import BalanceCard from "../components/BalanceCard";
import BalanceTotal from "../components/BalanceTotal";
import Error from "../components/Error";
import promiseRetry from "promise-retry";
import { calculate } from "../utils/token";

const masterape = require("../abis/masterape.json");

interface BalanceDetailsProps {
  contractAddress: string;
  routerContractAddress: string;
}

function BalanceDetails({
  contractAddress,
  routerContractAddress,
}: BalanceDetailsProps) {
  const [balances, setBalances] = useState<(BalanceLP | Balance)[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [retryNumber, setRetryNumber] = useState<number>(0);
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
        return calculate(web3, lp, routerContractAddress);
      });

      const completeBalance = await Promise.all(_balanceLPPair);

      setBalances(completeBalance);
    }

    setFetching(true);
    setInvalidContract(false);
    promiseRetry(function (retry, number) {
      setRetryNumber(number - 1);

      return queryContract().catch((e: any) => {
        if (e.message.indexOf("Invalid JSON RPC response") > -1) {
          retry(e);
        } else if (e.message.indexOf("the correct ABI for the contract") > -1) {
          setInvalidContract(true);
        }
      });
    }).finally(() => {
      setFetching(false);
    });
  }, [account, contractAddress, exchange, routerContractAddress]);

  const balanceDetails = balances.map((b) => (
    <BalanceCard key={b.lpAddress} balance={b} />
  ));

  function renderOrError() {
    if (fetching) {
      return (
        <p className="balance-details-status">
          Fetching from staking pool...{" "}
          {retryNumber ? <span>(Retry: {retryNumber})</span> : ""}
        </p>
      );
    } else if (invalidContract) {
      return <Error>Invalid Contract</Error>;
    } else if (balanceDetails.length === 0) {
      return (
        <p className="balance-details-status">
          There're no LPs in the given staking contract.
        </p>
      );
    } else {
      return (
        <>
          {balanceDetails}
          {<BalanceTotal balances={balances} />}
        </>
      );
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
