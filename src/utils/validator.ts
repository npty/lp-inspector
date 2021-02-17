import Web3 from "web3";

export function validateAddress(text: string) {
  return Web3.utils.isAddress(text);
}
