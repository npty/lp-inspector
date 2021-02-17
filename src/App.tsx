import React from "react";
import "./styles/App.css";
import "./styles/constants.css";
import { Web3ReactProvider } from "@web3-react/core";
import AddressInput from "./components/AddressInput";
import ConnectWallet from "./components/ConnectWallet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Web3 from "web3";

function getLibrary(provider: any, connector?: any) {
  return new Web3(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="app-container">
        <div className="app-content-container">
          <div className="app-header">
            <div className="app-header-left">
              <FontAwesomeIcon icon={faSearch} className="app-icon" />
              <h1>LP Inspector</h1>
            </div>
            <ConnectWallet>Connect</ConnectWallet>
          </div>
          <AddressInput
            placeholder="Enter staking contract address"
            label="Staking contract address"
          />
        </div>
      </div>
    </Web3ReactProvider>
  );
}

export default App;
