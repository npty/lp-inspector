import React, { useEffect, useState } from "react";
import "../styles/AddressInput.css";
import Dropdown from "./Dropdown";
import { ContractPreset } from "../types";
import { validateAddress } from "../utils/validator";

interface AddressInputProps {
  placeholder: string;
  label: string;
  defaultValue?: string;
  presets?: ContractPreset[];
  callback:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
}

function AddressInput({
  placeholder,
  label,
  defaultValue,
  presets,
  callback,
}: AddressInputProps) {
  const [address, setAddress] = useState(defaultValue || "");
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValue) {
      const validAddress = validateAddress(defaultValue);
      setValid(validAddress);
    }

    if (validateAddress(address)) {
      callback(address);
    }
  }, [defaultValue, address, callback]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    const validAddress = validateAddress(newValue);
    setValid(validAddress);
    setAddress(newValue);
    if (validAddress) {
      callback(newValue);
    }
  }

  return (
    <>
      <div className="address-input-header">
        <label className="address-input-label">{label}</label>
        {presets && <Dropdown callback={setAddress} presets={presets} />}
      </div>
      <div className="address-input-container">
        <input
          className={
            valid ? "address-input" : "address-input address-input-invalid"
          }
          value={address}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
    </>
  );
}

export default AddressInput;
