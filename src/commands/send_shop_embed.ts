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
  .setName("send_shop_embed")
  .setDescription("Send Shop Embed")
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
    const shopEmbed = new EmbedBuilder()
      .setTitle("🛍️ Dudes Shop 🛍️")
      .setDescription(
        "Looking to buy something? This is the place to shop around at.\n\n 🛒Click on the **View Store Items** button below to display a dropdown for all the store items. You could then select an item to buy it!\n\n 💵 Click on the **Check Balance** button below to display our current balance."
      );

    // Create the buttons
    const previewButton = new ButtonBuilder()
      .setCustomId("preview_shop")
      .setLabel("View Store Items")
      .setEmoji("🛒")
      .setStyle(ButtonStyle.Primary);

    const buyButton = new ButtonBuilder()
      .setCustomId("view_balance")
      .setLabel("💵 View Balance")
      .setStyle(ButtonStyle.Success);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      previewButton,
      buyButton
    );

    // Send the embed with buttons
    const message = await channel.send({
      embeds: [shopEmbed],
      components: [actionRow],
    });

    await interaction.reply({
      content: `Shop embed sent to ${channel}.`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
}
