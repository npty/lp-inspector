import React, { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import "../styles/ConnectWallet.css";

interface ConnectWalletProps {
  children: React.ReactNode;
}

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    56,
  ],
});

function ConnectWallet({ children }: ConnectWalletProps) {
  const { error } = useWeb3React()
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
  }

  return (
    <div className="connect-wallet-container" onClick={handleClick}>
      <button className="connect-wallet-btn">{btnText}</button>
    </div>
  );
}

export default ConnectWallet;
