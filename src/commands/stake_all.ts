import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { getUserOwnedTokenIds } from "../web3/thirdweb";
import { getMaticAddress, stakeNFT, userModel } from "../models/User";
import { errorHandler } from "../logger/errorHandler";

export const data = new SlashCommandBuilder()
  .setName("stake_all")
  .setDescription("Stakes all owned NFTs");

export async function execute(
  bot: ExtendedClient,
  interaction: CommandInteraction
) {
  try {
    await interaction.deferReply();
    const isUser = await userModel.exists({ discordID: interaction.user.id });
    if (!isUser)
      return await interaction.reply({
        content: "Please join the system first by doing `/join`",
        ephemeral: true,
      });

    const walletAddress = await getMaticAddress(interaction.user.id);
    const ownedIds = await getUserOwnedTokenIds(walletAddress);
    for (const tokenId of ownedIds) {
      await stakeNFT(interaction.user.id, tokenId);
    }

    return interaction.followUp({
      content: "All NFTs have been staked.",
      ephemeral: true,
    });
  } catch (err) {
    errorHandler(bot, err, "Stacking Error");
  }
}
