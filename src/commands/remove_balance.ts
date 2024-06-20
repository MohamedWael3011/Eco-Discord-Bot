import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandUserOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { isAdmin } from "../utils/isAdmin";
import { getBalance, removeBalance } from "../models/User";

export const data = new SlashCommandBuilder()
  .setName("remove_balance")
  .setDescription("Remove Balance")
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
  await interaction.deferReply();
  if (await isAdmin(interaction)) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const userBalance = await getBalance(user.id);
    if (Number(userBalance) < Number(amount)) {
        return await interaction.followUp({content:"the amount you entered is more that user's balance", ephemeral:true})
    }
    await removeBalance(user.id, Number(amount));
    return await interaction.followUp({
      content: `${user.username} balance has been reduced by ${amount}`,
    });
  }
}
