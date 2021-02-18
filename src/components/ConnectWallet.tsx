import React, { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { UnsupportedChainIdError } from "@web3-react/core";
import "../styles/ConnectWallet.css";

interface ConnectWalletProps {
  children: React.ReactNode;
  callback: React.Dispatch<React.SetStateAction<string>>;
}

const injectedConnector = new InjectedConnector({
  supportedChainIds: [56],
});

function ConnectWallet({ children, callback }: ConnectWalletProps) {
  const { activate, active, account, error } = useWeb3React<Web3Provider>();
  const [btnText, setBtnText] = useState(children);
  const [btnClass, setBtnClass] = useState("connect-wallet-btn");

  useEffect(() => {
    if (error && error instanceof UnsupportedChainIdError) {
      setBtnText("Supported only BSC chain (56).");
      setBtnClass("connect-wallet-btn connect-wallet-btn-error");
    } else if (account) {
      setBtnClass("connect-wallet-btn");
      const ellisizeText =
        account.substring(0, 6) +
        "..." +
        account.substring(account.length - 4, account.length);
      setBtnText(ellisizeText);
      callback(account);
    } else {
      setBtnClass("connect-wallet-btn");
      setBtnText(children);
    }
  }, [account, activate, active, callback, children, error]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    activate(injectedConnector);
  }

  return (
    <div className="connect-wallet-container" onClick={handleClick}>
      {!active ? (
        <button className={btnClass} disabled={active}>
          {btnText}
        </button>
      ) : (
        <p>{btnText}</p>
      )}
    </div>
  );
}

export default ConnectWallet;
