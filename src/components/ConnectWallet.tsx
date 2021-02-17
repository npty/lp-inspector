import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import "../styles/ConnectWallet.css";

interface ConnectWalletProps {
  children: React.ReactNode;
}

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    56,
  ],
});

function ConnectWallet({ children }: ConnectWalletProps) {
  const wa: any = window;
  const { activate, active, account } = useWeb3React<Web3Provider>();
  const [btnText, setBtnText] = useState(children);

  useEffect(() => {
    if (account) {
      const ellisizeText =
        account.substring(0, 8) +
        "..." +
        account.substring(account.length - 5, account.length);
      setBtnText(ellisizeText);
    } else {
      setBtnText(children);
    }
  }, [account, activate, active, children]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    activate(injectedConnector);
    // // const enabled = ethEnabled();
    // if (!enabled) {
    //   alert("Please install metamask extension to use this dapp.");
    // } else {
    //   console.log(wallet)
    //   // setBtnText(wallet)
    // }
  }

  function ethEnabled() {
    if (wa.ethereum) {
      wa.web3 = new Web3(wa.ethereum);
      wa.ethereum.enable();
      return true;
    }
    return false;
  }

  return (
    <div className="connect-wallet-container" onClick={handleClick}>
      <button className="connect-wallet-btn">{btnText}</button>
    </div>
  );
}

export default ConnectWallet;
