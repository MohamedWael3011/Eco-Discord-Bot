import {
  APIApplicationCommandOptionChoice,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  TextChannel,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import * as ShopUtils from "../models/Shop";
import {
  addBalance,
  getBalance,
  removeBalance,
  userModel,
} from "../models/User";
import { errorHandler } from "../logger/errorHandler";
import { ADMIN_CHAT } from "../consts/channels";
import buyItem from "../utils/buyItem";
export const data = new SlashCommandBuilder()
  .setName("flip_coin")
  .setDescription("Flips a coin")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("coin_choice")
      .setDescription("Item Name")
      .setRequired(true)
      .addChoices({ name: "Head", value: "0" }, { name: "Tail", value: "1" })
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("bet")
      .setDescription("Your Bet")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply();
  const isUser = await userModel.exists({ discordID: interaction.user.id });
  if (!isUser)
    return await interaction.followUp({
      content: "Please join the system by doing `/join` first.",
      ephemeral: true,
    });
  const coinChoice = interaction.options.getString("coin_choice");
  const bet = interaction.options.getNumber("bet");
  if (Number.isNaN(+bet))
    return await interaction.reply({
      content: "Please enter a valid bet",
      ephemeral: true,
    });

  const userBalance = await getBalance(interaction.user.id);
  if (+bet > userBalance) {
    return await interaction.followUp({
      content:
        "You cannot bet this amount as you don't have it in your balance",
      ephemeral: true,
    });
  }
  // Remove the balance
  await removeBalance(interaction.user.id, Number(bet));
  const botChoice = Math.floor(Math.random() * 1000) % 2;
  if (Number(coinChoice) == botChoice) {
    await addBalance(interaction.user.id, Number(bet) * 3);
    return await interaction.followUp({
      content: `Bot chose **${
        coinChoice === "0" ? "Head" : "Tail"
      }**, You won double your bet :D`,
    });
  } else {
    return await interaction.followUp({
      content: `Bot chose **${
        coinChoice === "0" ? "Tail" : "Head"
      }**, You lost your bet :(`,
    });
  }
}
