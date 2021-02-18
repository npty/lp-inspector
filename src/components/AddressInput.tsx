import React, { useEffect, useState } from "react";
import "../styles/AddressInput.css";
import { validateAddress } from "../utils/validator";

interface AddressInputProps {
  placeholder: string;
  label: string;
  defaultValue?: string;
  callback: React.Dispatch<React.SetStateAction<string>>;
}

function AddressInput({
  placeholder,
  label,
  defaultValue,
  callback,
}: AddressInputProps) {
  const [address, setAddress] = useState(defaultValue || "");
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValue) {
      const validAddress = validateAddress(defaultValue);
      setValid(validAddress);
    }
  }, [defaultValue]);

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
      <label className="address-input-label">{label}</label>
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
