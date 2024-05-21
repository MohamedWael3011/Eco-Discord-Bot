import { NFT, ThirdwebSDK, NFTMetadata } from "@thirdweb-dev/sdk";
import { config } from "dotenv";
import { ethers } from "ethers";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { addBalance, getDiscordUser } from "../models/User";
import { errorHandler } from "../logger/errorHandler";
config();
const chain = "polygon";
const sdk = new ThirdwebSDK(chain, { clientId: process.env.CLIENTID });

export async function getUserOwnedTokenIds(userAddress: string) {
  try {
    const contract = await sdk.getContract(process.env.CONTRACT);
    const ownedNFTs = await contract.erc721.getOwnedTokenIds(userAddress);
    const ownedNFTString = ownedNFTs.map((i) => i.toString());

    return ownedNFTString;
  } catch (err) {
    console.error(err);
  }
}

export async function isTokenOwner(userAddress: string, tokenId) {
  const contract = await sdk.getContract(process.env.CONTRACT);
  const ownedNFTs = await contract.erc721.getOwnedTokenIds(userAddress);
  const ownedNFTString = ownedNFTs.map((i) => i.toString());
  return ownedNFTString.includes(tokenId);
}
