import React, { useState } from "react";
import "./styles/App.css";
import "./styles/constants.css";
import { Web3ReactProvider } from "@web3-react/core";
import AddressInput from "./components/AddressInput";
import ConnectWallet from "./components/ConnectWallet";
import BalanceDetails from "./components/BalanceDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Web3 from "web3";
import { PANCAKE_ROUTER } from "./utils/constants";

function getLibrary(provider: any, connector?: any) {
  return new Web3(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

function App() {
  const [contractAddress, setContractAddress] = useState("");

  console.log(contractAddress);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="app-container">
        <div className="app-content-container">
          <div className="app-header">
            <div className="app-header-left">
              <FontAwesomeIcon icon={faSearch} className="app-icon" />
              <h1>BSC LP Inspector</h1>
            </div>
            <ConnectWallet>Connect</ConnectWallet>
          </div>
          <AddressInput
            placeholder="Enter Masterchef address"
            label="MasterChef address"
            callback={setContractAddress}
          />
          <AddressInput
            placeholder="Enter Router address"
            label="Router address (default to Pancakeswap)"
            defaultValue={PANCAKE_ROUTER}
            callback={setContractAddress}
          />
          <BalanceDetails contractAddress={contractAddress} />
        </div>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
