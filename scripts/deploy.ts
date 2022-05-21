import { ethers } from "ethers";
import "dotenv/config";
import * as customBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  /***** START Token Contract Deployment ******/
  console.log("Deploying Token contract");

  const tokenFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );

  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();

  console.log(`Token Contract deployed at ${tokenContract.address}`);
  /***** END Token Contract Deployment ******/

  /***** START CustomBallot Deployment ******/
  console.log("Deploying CustomBallot contract");

  const customBallotFactory = new ethers.ContractFactory(
    customBallotJson.abi,
    customBallotJson.bytecode,
    signer
  );
  const customBallotContract = await customBallotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS),
    tokenContract.address
  );
  console.log("Awaiting confirmations");
  await customBallotContract.deployed();
  console.log(`CustomBallot deployed at ${customBallotContract.address}`);
  /***** END Custom Ballot Deployment ******/

  console.log("Completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
