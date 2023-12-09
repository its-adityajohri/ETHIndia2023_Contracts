import { ethers, run } from "hardhat";
import { MyToken__factory, TokenBridge__factory } from "../typechain-types";

import * as addresses from "../address.json";

const destinationChainId: string = "44787"; // celo
// const destinationChainId: string = "11155111"; // sepolia

async function main() {
  const bridgeAmount = "1230000000000000000";

  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  console.log("using on chain id:", chainId);

  const admin = signers[0];
  const operator = signers[1];

  console.log("Using Address", await admin.getAddress());

  // @ts-ignore
  const contractAddress = addresses[chainId];

  const tokenBridge = TokenBridge__factory.connect(
    contractAddress.bridgeInstance,
    admin,
  );

  const tokenInstance = MyToken__factory.connect(
    contractAddress.tokenInstance,
    admin,
  );
  let tx = await tokenInstance.approve(
    await tokenBridge.getAddress(),
    bridgeAmount,
  );
  await tx.wait();

  tx = await tokenBridge.bridgeToken(
    destinationChainId,
    await tokenInstance.getAddress(),
    await admin.getAddress(),
    bridgeAmount,
  );

  console.log("Bridge transaction", tx.hash);
  return "Done";
}

main().then(console.log).catch(console.log);
