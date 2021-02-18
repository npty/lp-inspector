import BigNumber from 'bignumber.js'

export interface Balance {
  pool: number;
  balance: string;
  lpAddress: string;
  tokenA: Token;
  tokenB: Token;
  worth: string;
}

export interface Token {
  name: string;
  amount: BigNumber;
}
