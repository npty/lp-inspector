import Web3 from "web3";
import { BalanceLP, BaseBalance, Balance } from "../types";
import BigNumber from "bignumber.js";
import { BUSD } from "./constants";
import Exchange from "./exchange";
import { weiToEth } from "./unit";

const pair = require("../abis/pair.json");
const erc20 = require("../abis/erc20.json");

async function isLP(web3: Web3, lp: BaseBalance) {
  const contractLP = new web3.eth.Contract(pair, lp.lpAddress);
  try {
    await contractLP.methods.getReserves().call();
    return true;
  } catch (e: any) {
    return false;
  }
}

export async function calculate(
  web3: Web3,
  lp: BaseBalance,
  routerContractAddress: string
): Promise<Balance | BalanceLP> {
  const _isLP = await isLP(web3, lp);
  if (_isLP) {
    return calculateBalanceLP(web3, lp, routerContractAddress);
  } else {
    return calculateBalance(web3, lp, routerContractAddress);
  }
}

// Support tokens pair staking
async function calculateBalanceLP(
  web3: Web3,
  lp: BaseBalance,
  routerContractAddress: string
): Promise<BalanceLP> {
  const contractLP = new web3.eth.Contract(pair, lp.lpAddress);
  const totalSupply = await contractLP.methods.totalSupply().call();
  const {
    "0": reserveA,
    "1": reserveB,
  } = await contractLP.methods.getReserves().call();
  const tokenAmountA = new BigNumber(lp.balance)
    .dividedBy(totalSupply)
    .multipliedBy(reserveA);

  const tokenAmountB = new BigNumber(lp.balance)
    .dividedBy(totalSupply)
    .multipliedBy(reserveB);

  const tokenA = await contractLP.methods
    .token0()
    .call()
    .then((token: string) => token.toLowerCase());
  const tokenAContract = new web3.eth.Contract(erc20, tokenA);
  const tokenASymbol = await tokenAContract.methods.symbol().call();
  const tokenADecimals = await tokenAContract.methods.decimals().call();

  const tokenB = await contractLP.methods
    .token1()
    .call()
    .then((token: string) => token.toLowerCase());
  const tokenBContract = new web3.eth.Contract(erc20, tokenB);
  const tokenBSymbol = await tokenBContract.methods.symbol().call();
  const tokenBDecimals = await tokenBContract.methods.decimals().call();

  let worth: string = "0";
  if (tokenA !== BUSD && tokenB !== BUSD) {
    const exchange = new Exchange(routerContractAddress);
    const busdAmount = await exchange.getEquivalentToken(
      tokenA,
      BUSD,
      tokenAmountA.integerValue().toFixed()
    );
    const _worth = new BigNumber(2)
      .multipliedBy(busdAmount)
      .integerValue()
      .toFixed();
    worth = parseFloat(weiToEth(_worth)).toFixed(2);
  } else {
    const busdAmount = tokenA === BUSD ? tokenAmountA : tokenAmountB;
    const _worth = new BigNumber(2)
      .multipliedBy(busdAmount)
      .integerValue()
      .toFixed();
    worth = parseFloat(weiToEth(_worth)).toFixed(2);
  }

  return {
    ...lp,
    tokenA: { name: tokenASymbol, amount: tokenAmountA, decimals: tokenADecimals },
    tokenB: { name: tokenBSymbol, amount: tokenAmountB, decimals: tokenBDecimals },
    worth,
  };
}

// Support single token staking
async function calculateBalance(
  web3: Web3,
  lp: BaseBalance,
  routerContractAddress: string
): Promise<Balance> {
  const contract = new web3.eth.Contract(erc20, lp.lpAddress);
  const tokenSymbol = await contract.methods.symbol().call();
  const tokenDecimals = await contract.methods.decimals().call();
  const tokenAmount = lp.balance;
  const token = {
    name: tokenSymbol,
    amount: new BigNumber(tokenAmount),
    decimals: tokenDecimals
  };

  let worth = "0";

  if (lp.lpAddress.toLowerCase() !== BUSD) {
    const exchange = new Exchange(routerContractAddress);
    const [reserveA, reserveB] = await exchange.getReserves(lp.lpAddress, BUSD);
    const busdAmount = new BigNumber(reserveA)
      .div(reserveB)
      .multipliedBy(tokenAmount)
      .integerValue()
      .toFixed();
    worth = parseFloat(weiToEth(busdAmount)).toFixed(2);
  } else {
    worth = parseFloat(weiToEth(lp.balance)).toFixed(2);
  }

  return {
    ...lp,
    token,
    worth,
  };
}
