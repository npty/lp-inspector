import "../styles/Dropdown.css";
import { ContractPreset } from "../types";

interface DropdownProps {
  callback: React.Dispatch<React.SetStateAction<string>>;
  presets: ContractPreset[];
}

function Dropdown({ callback, presets }: DropdownProps) {
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    callback(e.target.value);
  }

  return (
    <div className="dropdown">
      <select name="contract" onChange={onChange}>
        {presets.map((preset) => {
          return <option key={preset.name} value={preset.address}>{preset.name}</option>;
        })}
      </select>
    </div>
  );
}

export default Dropdown;
