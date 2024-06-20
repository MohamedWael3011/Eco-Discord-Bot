import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { shopEmbedBuilder } from "../utils/shopEmbedBuilder";
import shopMenuBuilder from "../utils/menu";

export const data = new SlashCommandBuilder()
  .setName("shop")
  .setDescription("previews shop");

export async function execute(
  bot: ExtendedClient,
  interaction: CommandInteraction
) {

  const embeds = await shopEmbedBuilder(bot);
  await shopMenuBuilder(bot,interaction); // Call pagination method with fetched items

}
