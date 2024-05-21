import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong");

export async function execute(bot:ExtendedClient,interaction: CommandInteraction) {
  await interaction.reply("pong");
}
