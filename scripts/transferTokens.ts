import { ethers, run } from "hardhat";
import { MyToken__factory, TokenBridge__factory } from "../typechain-types";

import * as addresses from "../address.json";

async function main() {
  const amountToSend = "123978624837628723344";
  const toAddress = "0x694a967A60b61Cb23dAA46571A137e4Fb0656076";
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  console.log("using on chain id:", chainId);

  const admin = signers[0];

  console.log("Using Address", await admin.getAddress());

  // @ts-ignore
  const contractAddress = addresses[chainId];

  const tokenInstance = MyToken__factory.connect(
    contractAddress.tokenInstance,
    admin,
  );

  const tx = await tokenInstance.transfer(toAddress, amountToSend);
  const receipt = await tx.wait();
  console.log("Sent tokens", receipt?.hash);
  return "Done";
}

main().then(console.log).catch(console.log);
