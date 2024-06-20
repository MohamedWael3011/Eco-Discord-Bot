import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { isAdmin } from "../utils/isAdmin";
import { addBalance } from "../models/User";
import {
  updateMessageRewardRates,
  updateReactRewardRates,
} from "../models/Rewards";

export const data = new SlashCommandBuilder()
  .setName("update_react_rate")
  .setDescription("Update Message")
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("react_rate")
      .setDescription("New Rate")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  if (await isAdmin(interaction)) {
    await interaction.deferReply();

    const amount = interaction.options.getNumber("react_rate");
    await updateReactRewardRates(Number(amount));
    return await interaction.followUp({
      content: `React Reward Rate Has been updated :D`,
    });
  }
}
