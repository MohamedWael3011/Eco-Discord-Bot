import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";

export const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Join instructions");

export async function execute(
  bot: ExtendedClient,
  interaction: CommandInteraction
) {
  await interaction.reply(
    {content:"please verify your account by visiting : https://drippy-dudes-auth.vercel.app/", ephemeral:true}
  );
}
