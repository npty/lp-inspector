import Web3 from 'web3';

export function ethToWei(eth: string): string {
  return Web3.utils.toWei(eth);
}

export function weiToEth(wei: string): string {
  return Web3.utils.fromWei(wei);
}

export function usdtToWei(usdt: string): string {
  return Web3.utils.toWei(usdt, 'mwei');
}

export function gweiToWei(gwei: string): string {
  return Web3.utils.toWei(gwei, 'gwei');
}
