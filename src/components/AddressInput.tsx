import React, { useState } from "react";
import "../styles/AddressInput.css";
import { validateAddress } from "../utils/validator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

interface AddressInputProps {
  placeholder: string;
  label: string;
}

function AddressInput({ placeholder, label }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const [valid, setValid] = useState<boolean>(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    const validAddress = validateAddress(newValue);
    setValid(validAddress);
    setAddress(newValue);
  }

  return (
    <>
      <label className="address-input-label">{label}</label>
      <div className="address-input-container">
        <input
          className={
            valid ? "address-input" : "address-input address-input-invalid"
          }
          placeholder={placeholder}
          onChange={onChange}
        />
        {valid ? (
          <FontAwesomeIcon icon={faCheck} className="address-input-icon" />
        ) : (
          <FontAwesomeIcon
            icon={faTimes}
            className="address-input-icon address-input-icon-invalid"
          />
        )}
      </div>
    </>
  );
}

export default AddressInput;
