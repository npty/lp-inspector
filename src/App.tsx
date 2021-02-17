import React from "react";
import "./styles/App.css";
import "./styles/constants.css";
import AddressInput from "./components/AddressInput";

function App() {
  return (
    <div className="app-container">
      <div className="app-content-container">
        <h1>LP Inspector</h1>
        <AddressInput
          placeholder="Enter staking contract address"
          label="Staking contract address"
        />
      </div>
    </div>
  );
}

export default App;
