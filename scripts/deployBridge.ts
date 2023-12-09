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

async function main() {
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  console.log("deploying on chain id:", chainId);

  const admin = signers[0];

  console.log("Using Address", await admin.getAddress());

  let verificationResult;

  const inbox = await deployInbox(admin);
  const outbox = await deployOutbox(admin);

  const name = "Decimal Demo Bridge token";
  const symbol = "DDBT";

  const tokenInstance = await deployToken(name, symbol, admin);

  const bridgeInstance = await deployTokenBridge(inbox, outbox, admin);

  await (
    await tokenInstance
      .connect(admin)
      .transfer(
        await bridgeInstance.getAddress(),
        tokenSupply.div(3).toFixed(0),
      )
  ).wait();

  try {
    verificationResult = await run("verify:verify", {
      address: await inbox.getAddress(),
      constructorArguments: [await admin.getAddress()],
    });

    verificationResult = await run("verify:verify", {
      address: await outbox.getAddress(),
      constructorArguments: [],
    });

    verificationResult = await run("verify:verify", {
      address: await tokenInstance.getAddress(),
      constructorArguments: [
        name,
        symbol,
        await admin.getAddress(),
        tokenSupply.toFixed(0),
      ],
    });

    verificationResult = await run("verify:verify", {
      address: await bridgeInstance.getAddress(),
      constructorArguments: [
        await inbox.getAddress(),
        await outbox.getAddress(),
        await admin.getAddress(),
      ],
    });
  } catch (ex) {
    console.log(ex);
  }

  return {
    chainId,
    inbox: await inbox.getAddress(),
    outbox: await outbox.getAddress(),
    tokenInstance: await tokenInstance.getAddress(),
    bridgeInstance: await bridgeInstance.getAddress(),
  };
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

async function deployToken(
  name: string,
  symbol: string,
  admin: HardhatEthersSigner,
): Promise<MyToken> {
  const tokenInstance = await new MyToken__factory(admin).deploy(
    name,
    symbol,
    await admin.getAddress(),
    tokenSupply.toFixed(0),
  );
  return tokenInstance;
}

async function deployTokenBridge(
  inbox: Inbox,
  outbox: Outbox,
  admin: HardhatEthersSigner,
): Promise<TokenBridge> {
  const instance = await new TokenBridge__factory(admin).deploy(inbox, outbox);
  return instance;
}

main().then(console.log).catch(console.log);
