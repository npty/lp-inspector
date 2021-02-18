import Web3 from "web3";
import { Contract } from "web3-eth-contract";

const factoryAbi = require("../abis/factory.json");
const router = require("../abis/router.json");
const pairAbi = require("../abis/pair.json");

export default class Exchange {
  private web3: Web3;
  private exchangeContract: Contract;
  private exchangeFactoryAddress: string = "";
  private exchangeRouterAddress: string;

  constructor(exchangeRouterAddress: string) {
    const provider = new Web3.providers.HttpProvider('https://bsc-dataseed3.ninicoin.io/', {
      timeout: 120000
    })
    this.web3 = new Web3(provider);
    this.exchangeContract = new this.web3.eth.Contract(
      router,
      exchangeRouterAddress
    );
    this.exchangeRouterAddress = exchangeRouterAddress;
  }

  async getEquivalentToken(tokenA: string, tokenB: string, amount: string) {
    const [reserveA, reserveB] = await this.getReserves(tokenA, tokenB);
    return this.exchangeContract.methods
      .getAmountOut(amount, reserveA, reserveB)
      .call();
  }

  async getReserves(tokenA: string, tokenB: string) {
    if (!this.exchangeFactoryAddress) {
      this.exchangeFactoryAddress = await this.exchangeContract.methods
        .factory()
        .call();
    }

    const factory = new this.web3.eth.Contract(
      factoryAbi,
      this.exchangeFactoryAddress
    );
    const pair = await factory.methods.getPair(tokenA, tokenB).call();
    const pairContract = new this.web3.eth.Contract(pairAbi, pair);
    const {
      "0": reserveTokenA,
      "1": reserveTokenB,
    } = await pairContract.methods.getReserves().call();
    const token0 = await pairContract.methods
      .token0()
      .call()
      .then((token: string) => token.toLowerCase());

    return [
      token0 === tokenA ? reserveTokenA : reserveTokenB,
      token0 === tokenA ? reserveTokenB : reserveTokenA,
    ];
  }
}
