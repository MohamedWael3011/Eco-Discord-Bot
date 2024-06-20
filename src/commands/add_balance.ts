import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { addBankData } from "../models/Bank";
import { isAdmin } from "../utils/isAdmin";
import { addBalance } from "../models/User";

export const data = new SlashCommandBuilder()
  .setName("add_balance")
  .setDescription("Add Balance")
  .addUserOption(
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("User")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("amount")
      .setDescription("Amount")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  if (await isAdmin(interaction)) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    await addBalance(user.id, Number(amount));
    return await interaction.reply({
      content: `${user.username} has been funded with ${amount}`,
    });
  }
}
