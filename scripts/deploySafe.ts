import { ethers, run } from "hardhat";
import { BigNumberish, Signer } from "ethers";

import {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
} from "@safe-global/protocol-kit";

import { KycWallet__factory, Verifier__factory } from "../typechain-types";
// import * as kycData from "../kycData.json";
import * as kycData from "../kycData2.json";

async function main() {
  const signers = await ethers.getSigners();

  const admin = signers[0];

  let verifier = await new Verifier__factory(admin).deploy();
  await verifier.waitForDeployment();

  console.log("verifier", await verifier.getAddress());
  let wallet = await new KycWallet__factory(admin).deploy(
    verifier,
    kycData.a as [BigNumberish, BigNumberish],
    kycData.b as [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
    kycData.c as [BigNumberish, BigNumberish],
    kycData.Input,
  );
  await wallet.waitForDeployment();
  console.log("kyc module", await wallet.getAddress());

  const ethAdapterOwner1 = new EthersAdapter({
    ethers,
    signerOrProvider: admin,
  });

  const safeAccountConfig: SafeAccountConfig = {
    owners: [await admin.getAddress(), await wallet.getAddress()],
    threshold: 1,
  };

  const safeFactory = await SafeFactory.create({
    ethAdapter: ethAdapterOwner1,
  });

  const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

  const safeAddress = await safeSdkOwner1.getAddress();

  console.log("Your Safe has been deployed:");
  console.log(`${safeAddress}`);

  let verificationResult;
  verificationResult = await run("verify:verify", {
    address: await verifier.getAddress(),
    constructorArguments: [],
  });

  verificationResult = await run("verify:verify", {
    address: await wallet.getAddress(),
    constructorArguments: [
      await verifier.getAddress(),
      kycData.a as [BigNumberish, BigNumberish],
      kycData.b as [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      kycData.c as [BigNumberish, BigNumberish],
      kycData.Input,
    ],
  });

  return "Done Verification";
}

main().then(console.log).catch(console.log);
