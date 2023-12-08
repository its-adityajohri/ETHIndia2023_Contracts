import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { BigNumberish, Signer } from "ethers";
import { BigNumber } from "bignumber.js";
import {
  Verifier__factory,
  Verifier,
  KycWallet,
  KycWallet__factory,
} from "../typechain-types";

import * as kycData from "../kycData.json";

describe("Check Wallet", () => {
  let wallet: KycWallet;
  let verifier: Verifier;

  let admin: Signer;
  beforeEach(async () => {
    let signers = await ethers.getSigners();
    admin = signers[0];
    verifier = await new Verifier__factory(admin).deploy();
    wallet = await new KycWallet__factory(admin).deploy(
      verifier,
      kycData.a as [BigNumberish, BigNumberish],
      kycData.b as [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      kycData.c as [BigNumberish, BigNumberish],
      kycData.Input,
    );
  });

  it("Check wallet", async () => {
    console.log("KycWallet Address is", await wallet.getAddress());
  });
});
