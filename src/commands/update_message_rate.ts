import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { isAdmin } from "../utils/isAdmin";
import { addBalance } from "../models/User";
import { updateMessageRewardRates } from "../models/Rewards";

export const data = new SlashCommandBuilder()
  .setName("update_message_rate")
  .setDescription("Update Message")
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("message_rate")
      .setDescription("New Rate")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  if (await isAdmin(interaction)) {
    const amount = interaction.options.getNumber("message_rate");
    await updateMessageRewardRates(Number(amount));
    return await interaction.reply({
      content: `Message Reward Rate Has been updated :D`,
    });
  }
}
