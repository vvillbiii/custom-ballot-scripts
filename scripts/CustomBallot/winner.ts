import { ethers, Contract } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { CustomBallot } from "../../typechain/CustomBallot";
import "dotenv/config";
import * as customBallotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten", {
    etherscan: process.env.ETHERSCAN_API_KEY,
  });
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const customBallotAddress = process.argv[2];
  console.log({ customBallotAddress });
  console.log(
    `Attaching ballot contract interface to address ${customBallotAddress}`
  );

  //creating contract
  const customBallotContract: CustomBallot = new Contract(
    customBallotAddress,
    customBallotJson.abi,
    signer
  ) as CustomBallot;

  const tx = await customBallotContract.winnerName();
  console.log(`The winning proposal is ${tx}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
