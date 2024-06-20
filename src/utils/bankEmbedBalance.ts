import { EmbedBuilder } from "discord.js";
import { getBankBalance } from "../models/User"; // Assuming the user functions are in the User model file
import { ExtendedClient } from "../interfaces/ExtendedClient";

export async function bankEmbedBuilder(bot: ExtendedClient, discordID: string) {
  const bankBalance = await getBankBalance(discordID);

  const bankEmbed = new EmbedBuilder()
    .setTitle("🏦 Your Bank Balance 🏦")
    .setDescription(`Your current bank balance is: **${bankBalance}** coins.`);

  return bankEmbed;
}