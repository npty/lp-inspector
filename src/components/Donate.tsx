import React from "react";
import "../styles/Donate.css";

function Donate() {
  async function donate() {
    const wa: any = window;
    const ethereum = wa.ethereum;

    if (ethereum) {
      const transactionParameters = {
        gasPrice: "0x2540BE400",
        gas: "0xC350",
        to: "0x7FAC3878A3D730bb4b4267b71EF1be02589e8dA3",
        from: ethereum.selectedAddress,
        value: "0x16345785D8A0000",
      };

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
    }
  }

  return (
    <div className="donate-container">
      <button onClick={donate}>Donate for my panty</button>
    </div>
  );
}

export default Donate;
