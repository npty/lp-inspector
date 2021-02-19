import React, { useEffect, useState } from "react";
import "./styles/App.css";
import "./styles/constants.css";
import { Web3ReactProvider } from "@web3-react/core";
import AddressInput from "./components/AddressInput";
import ConnectWallet from "./components/ConnectWallet";
import BalanceDetails from "./components/BalanceDetails";

import Footer from "./components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchDollar } from "@fortawesome/free-solid-svg-icons";
import Web3 from "web3";
import { PANCAKE_ROUTER } from "./utils/constants";

function getLibrary(provider: any, connector?: any) {
  return new Web3(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

function App() {
  const [contractAddress, setContractAddress] = useState("");
  const [routercontractAddress, setRouterContractAddress] = useState(
    PANCAKE_ROUTER
  );
  const [address, setAddress] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    setShowDetails(contractAddress !== "" && routercontractAddress !== "");

    return () => {
      setShowDetails(false);
    };
  }, [routercontractAddress, contractAddress, showDetails]);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="app-container">
        <div className="app-content-container">
          <div className="app-header">
            <div className="app-header-left">
              <FontAwesomeIcon icon={faSearchDollar} className="app-icon" />
              <h1>How much is my LP worth?</h1>
            </div>
            <ConnectWallet callback={setAddress}>Connect</ConnectWallet>
          </div>
          {address ? (
            <>
              <AddressInput
                placeholder="Enter Masterchef address"
                label="MasterChef address"
                callback={setContractAddress}
              />
              <AddressInput
                placeholder="Enter Router address"
                label="Router address (default to Pancakeswap)"
                defaultValue={routercontractAddress}
                callback={setRouterContractAddress}
              />
              <div className="app-details-section">
                {showDetails ? (
                  <BalanceDetails
                    contractAddress={contractAddress}
                    routerContractAddress={routercontractAddress}
                  />
                ) : (
                  <p>Fill contract addresses above to see details here.</p>
                )}
              </div>
            </>
          ) : (
            <p className="app-connect-wallet-first">Connect wallet to use the app.</p>
          )}
          <Footer showDonate={address !== ''} />
        </div>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
