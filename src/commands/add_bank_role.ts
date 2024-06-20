import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  TextChannel,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import * as ShopUtils from "../models/Shop";
import { getBalance, removeBalance, userModel } from "../models/User";
import { errorHandler } from "../logger/errorHandler";
import { ADMIN_CHAT } from "../consts/channels";
import buyItem from "../utils/buyItem";
import { addBankData } from "../models/Bank";
import { isAdmin } from "../utils/isAdmin";

export const data = new SlashCommandBuilder()
  .setName("add_bank_role")
  .setDescription("Add role to bank")
  .addRoleOption(
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("Role")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("rate")
      .setDescription("Rate")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  if(await isAdmin(interaction))
{  const role = interaction.options.getRole("role");
  const rate = interaction.options.getNumber("rate");
  await addBankData(role.id, Number(rate));
  return await interaction.reply({
    content: `Role ${role.name} has been added to bank with intrest rate of ${rate}`,
    ephemeral: true,
  });}
}
