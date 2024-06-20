import { schedule } from "node-cron";
import { unstakeNFT, userModel } from "../models/User";
import { getUserOwnedTokenIds } from "../web3/thirdweb";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../logger/errorHandler";
import { TextChannel } from "discord.js";
import isListed from "./opensea/opensea";
import { Config } from "../models/Rewards";

// Schedule a task to run every day at 6:30 PM UTC
export async function automateSched(bot: ExtendedClient) {
  schedule("30 18 * * *", async () => {
    console.log(
      "Running scheduled task to update staked NFTs and fund balances."
    );

    try {
      const users = await userModel.find({ stakedTokenIds: { $ne: [] } });
      for (const user of users) {
        const ownedNFTs = await getUserOwnedTokenIds(user.maticAddress);
        for (const tokenId of user.stakedTokenIds) {
          if (!ownedNFTs.includes(tokenId)) {
            await unstakeNFT(user.discordID, tokenId);
          }
          const isList = await isListed(Number(tokenId), bot);
          console.log(isList);
          if (isList) {
            await unstakeNFT(user.discordID, tokenId);
          }
        }
      }
      // After updating NFTs, add 50 to each user's bank balance for each staked NFT
      for (const user of users) {
        user.bankBalance =
          (user.bankBalance || 0) + user.stakedTokenIds.length * 50;
        await user.save();
      }
      const config = await Config.findOne({ name: "default" });

      const ADMIN_CHAT = config.adminChannel;
      const adminChat = (await bot.channels.fetch(ADMIN_CHAT)) as TextChannel;
      await adminChat.send("Staking Rewards has been funded successfully");
    } catch (error) {
      errorHandler(bot, error, "Staking Rewards Error");
    }
  });
}
