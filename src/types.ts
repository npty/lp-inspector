import BigNumber from 'bignumber.js'

export interface BaseBalance {
  pool: number;
  balance: string;
  lpAddress: string;
}

export interface BalanceLP extends BaseBalance {
  tokenA: Token;
  tokenB: Token;
  worth: string;
}

export interface Balance extends BaseBalance {
  token: Token;
  worth: string;
}

export interface Token {
  name: string;
  amount: BigNumber;
}
