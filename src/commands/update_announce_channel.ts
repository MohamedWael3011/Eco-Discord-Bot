import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandNumberOption,
    SlashCommandUserOption,
  } from "discord.js";
  import { ExtendedClient } from "../interfaces/ExtendedClient";
  import { isAdmin } from "../utils/isAdmin";
  import { addBalance } from "../models/User";
  import {
    updateAdminChannel,
    updateMessageRewardRates,
  } from "../models/Rewards";
  
  export const data = new SlashCommandBuilder()
    .setName("update_announce_channel")
    .setDescription("Update Admin")
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName("announce_channel")
        .setDescription("New Channel")
        .setRequired(true)
    );
  
  export async function execute(
    bot: ExtendedClient,
    interaction: ChatInputCommandInteraction
  ) {
    if (await isAdmin(interaction)) {
      await interaction.deferReply();
      const channel = interaction.options.getChannel("announce_channel");
      await updateAdminChannel(channel.id);
      return await interaction.followUp({
        content: `Announcement Channel Has been updated :D`,
      });
    }
  }
  