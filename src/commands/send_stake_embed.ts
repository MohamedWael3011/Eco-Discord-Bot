import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  TextChannel,
  ChannelType,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { isAdmin } from "../utils/isAdmin";

export const data = new SlashCommandBuilder()
  .setName("send_stake_embed")
  .setDescription("Send Stake Embed")
  .addChannelOption(
    new SlashCommandChannelOption()
      .setName("channel")
      .setDescription("Desired channel")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText) // Ensure only text channels can be selected
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    if (!(await isAdmin(interaction))) return;
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;

    // Create the initial embed
    const bankEmbed = new EmbedBuilder()
      .setTitle("🏦 Staking 🏦")
      .setDescription("Learn more about our staking system!");

    // Create the buttons
    const stakeButton = new ButtonBuilder()
      .setCustomId("stake_all")
      .setLabel("Stake All NFTs")
      .setStyle(ButtonStyle.Secondary);
    const connectButton = new ButtonBuilder()
      .setCustomId("connect_wallet")
      .setLabel("Connect Wallet")
      .setStyle(ButtonStyle.Secondary);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      stakeButton,
      connectButton
    );

    // Send the embed with buttons
    const message = await channel.send({
      embeds: [bankEmbed],
      components: [actionRow],
    });

    await interaction.reply({
      content: `Stake embed sent to ${channel}.`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
}
