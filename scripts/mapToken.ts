import { ethers, run } from "hardhat";
import { Inbox__factory, TokenBridge__factory } from "../typechain-types";

import * as addresses from "../address.json";

// const destinationChainId: string = "44787"; // celo
// const destinationChainId: string = "11155111"; // sepolia
const destinationChainId: string = "421614"; // arbSepolia

async function main() {
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  console.log("using on chain id:", chainId);

  const admin = signers[0];
  const operator = signers[1];

  console.log("Using Address", await admin.getAddress());

  // @ts-ignore
  const contractAddress = addresses[chainId];

  const inbox = Inbox__factory.connect(contractAddress.inbox, admin);
  await inbox.grantRole(await inbox.OPERATOR_ROLE(), await admin.getAddress());
  await inbox.grantRole(
    await inbox.OPERATOR_ROLE(),
    await operator.getAddress(),
  );

  const tokenBridge = TokenBridge__factory.connect(
    contractAddress.bridgeInstance,
    admin,
  );

  // @ts-ignore
  const destinationContractAddress = addresses[destinationChainId];

  let tx = await tokenBridge.setCrossTokenAddress(
    destinationChainId,
    contractAddress.tokenInstance,
    destinationContractAddress.tokenInstance,
  );
  await tx.wait();

  tx = await tokenBridge.setCrossChainBridgeMapper(
    destinationChainId,
    destinationContractAddress.bridgeInstance,
  );
  await tx.wait();
  return "Done";
}

main().then(console.log).catch(console.log);
