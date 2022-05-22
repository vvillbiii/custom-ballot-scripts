import { ethers, Contract } from "ethers";
import "dotenv/config";
import tokenJson from "../../artifacts/contracts/Token.sol/MyToken.json";
import { TeamGToken } from "../../typechain/TeamGToken";

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
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  if (process.argv.length < 3) throw new Error("token address missing");
  const tokenAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("Voter address missing");
  const delegateeAddress = process.argv[3];
  console.log({ tokenAddress, delegateeAddress });
  console.log(`Attaching token contract interface to address ${tokenAddress}`);
  const votePower = 100;

  //creating new contract
  const tokenContract: TeamGToken = new Contract(
    tokenAddress,
    tokenJson.abi,
    signer
  ) as TeamGToken;

  const mintTx = await tokenContract.mint(delegateeAddress, votePower);
  await mintTx.wait();
  console.log(`Mint transaction complete ${mintTx.hash}`);

  const tx = await tokenContract.delegate(delegateeAddress);
  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Transaction complete ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
