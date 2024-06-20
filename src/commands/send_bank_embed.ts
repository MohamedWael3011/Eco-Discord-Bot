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
  .setName("send_bank_embed")
  .setDescription("Send Bank Embed")
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
    if(!(await isAdmin(interaction)))
      return;
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;

    // Create the initial embed
    const bankEmbed = new EmbedBuilder()
      .setTitle("🏦 Bank 🏦")
      .setDescription(
        "Manage your bank balance here.\n\n 💵 Click on the **View Balance** button below to see your current bank balance.\n\n ➕ Click on the **Add Balance** button to deposit funds.\n\n ➖ Click on the **Remove Balance** button to withdraw funds."
      );

    // Create the buttons
    const viewBalanceButton = new ButtonBuilder()
      .setCustomId("view_bankbalance")
      .setLabel("💵 View Balance")
      .setStyle(ButtonStyle.Success);

    const addBalanceButton = new ButtonBuilder()
      .setCustomId("add_balance")
      .setLabel("➕ Add Balance")
      .setStyle(ButtonStyle.Primary);

    const removeBalanceButton = new ButtonBuilder()
      .setCustomId("remove_balance")
      .setLabel("➖ Withdraw Balance")
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      viewBalanceButton,
      addBalanceButton,
      removeBalanceButton
    );

    // Send the embed with buttons
    const message = await channel.send({
      embeds: [bankEmbed],
      components: [actionRow],
    });

    await interaction.reply({
      content: `Bank embed sent to ${channel}.`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
}
