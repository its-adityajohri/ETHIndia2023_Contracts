import { ethers, run } from "hardhat";
import {
  Inbox,
  Inbox__factory,
  MyToken,
  MyToken__factory,
  Outbox,
  Outbox__factory,
  TokenBridge,
  TokenBridge__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import BigNumber from "bignumber.js";

const tokenSupply = new BigNumber(10).pow(18).multipliedBy(1000000000000);

import * as addresses from "../address.json";

async function main() {
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  console.log("deploying on chain id:", chainId);

  const admin = signers[0];

  console.log("Using Address", await admin.getAddress());

  let verificationResult;

  const name = "Decimal Demo Bridge token";
  const symbol = "DDBT";

  // @ts-ignore
  const contractAddress = addresses[chainId];

  try {
    verificationResult = await run("verify:verify", {
      address: contractAddress.inbox,
      constructorArguments: [await admin.getAddress()],
    });

    verificationResult = await run("verify:verify", {
      address: contractAddress.outbox,
      constructorArguments: [],
    });

    verificationResult = await run("verify:verify", {
      address: contractAddress.tokenInstance,
      contract: "contracts/MyToken.sol:MyToken",
      constructorArguments: [
        name,
        symbol,
        await admin.getAddress(),
        tokenSupply.toFixed(0),
      ],
    });

    verificationResult = await run("verify:verify", {
      address: contractAddress.bridgeInstance,
      constructorArguments: [
        contractAddress.inbox,
        contractAddress.outbox
      ],
    });
  } catch (ex) {
    console.log(ex);
  }

  return "Done Verification";
}

main().then(console.log).catch(console.log);
