import React from "react";
import "../styles/Footer.css";
import Donate from "./Donate";

interface FooterProps {
  showDonate: boolean;
}

function Footer({ showDonate }: FooterProps) {

  return (
    <footer className="footer-container">
      {showDonate && <Donate />}
      <p>
        How much is my LP worth? by <b>nopantytonight ✨</b> The source code is
        licensed <b>MIT</b>.
      </p>
    </footer>
  );
}

export default Footer;
