import { ethers, run } from "hardhat";
import {
  Inbox,
  Inbox__factory,
  Outbox,
  Outbox__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function main() {
  const signers = await ethers.getSigners();

  const admin = signers[0];

  console.log("Using Address", await admin.getAddress());

  let verificationResult;

  const inbox = await deployInbox(admin);
  const outbox = await deployOutbox(admin);

  verificationResult = await run("verify:verify", {
    address: await inbox.getAddress(),
    constructorArguments: [await admin.getAddress()],
  });

  verificationResult = await run("verify:verify", {
    address: await outbox.getAddress(),
    constructorArguments: [],
  });

  return "Done";
}

async function deployInbox(admin: HardhatEthersSigner): Promise<Inbox> {
  const inbox = await new Inbox__factory(admin).deploy(
    await admin.getAddress(),
  );
  return inbox;
}

async function deployOutbox(admin: HardhatEthersSigner): Promise<Outbox> {
  const outbox = await new Outbox__factory(admin).deploy();
  return outbox;
}

main().then(console.log).catch(console.log);
