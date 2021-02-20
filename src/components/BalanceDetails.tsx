import React, { useState, useEffect, useCallback } from "react";
import "../styles/BalanceDetails.css";
import "../styles/BalanceCard.css";
import "../styles/BalanceTotal.css";
import { BalanceLP, Balance } from "../types";
import BalanceCard from "../components/BalanceCard";
import BalanceTotal from "../components/BalanceTotal";
import Error from "../components/Error";
import promiseRetry from "promise-retry";
import { queryContract } from "../utils/calculate";

interface BalanceDetailsProps {
  contractAddress: string;
  routerContractAddress: string;
  address: string
}

function BalanceDetails({
  contractAddress,
  routerContractAddress,
  address
}: BalanceDetailsProps) {
  const [balances, setBalances] = useState<(BalanceLP | Balance)[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [retryNumber, setRetryNumber] = useState<number>(0);
  const [invalidContract, setInvalidContract] = useState(false);

  const refreshCallback = useCallback(refresh, [
    address,
    contractAddress,
    routerContractAddress,
  ]);

  useEffect(() => {
    refreshCallback();
  }, [refreshCallback]);

  function renderOrError() {
    const balanceDetails = balances.map((b) => (
      <BalanceCard key={b.lpAddress} balance={b} />
    ));
    if (fetching) {
      return (
        <p className="balance-details-status">
          Fetching data from the staking pool...{" "}
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

  function refresh() {
    setFetching(true);
    setInvalidContract(false);
    promiseRetry(function (retry, number) {
      setRetryNumber(number - 1);

      return queryContract(
        routerContractAddress,
        setBalances,
        address,
        contractAddress
      ).catch((e: any) => {
        console.log(e)
        if (e.message.indexOf("Invalid JSON RPC response") > -1) {
          retry(e);
        } else if (e.message.indexOf("the correct ABI for the contract") > -1) {
          setInvalidContract(true);
        }
      });
    }).finally(() => {
      setFetching(false);
    });
  }

  return (
    <div className="balance-details-container">
      <h2>
        Staking Details{" "}
        {!fetching && <button onClick={refresh}>Refresh</button>}
      </h2>
      <div className="balance-details-content-container">{renderOrError()}</div>
    </div>
  );
}

export default BalanceDetails;
