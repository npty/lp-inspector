import React from "react";
import "../styles/Error.css";

interface ErrorProps {
  children: React.ReactNode;
}

function Error({ children }: ErrorProps) {
  return <div className="error-container">{children}</div>;
}

export default Error;
