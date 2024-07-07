import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  TextChannel,
  ChannelType,
  SlashCommandStringOption,
  SlashCommandNumberOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { isAdmin } from "../utils/isAdmin";
import { errorHandler } from "../logger/errorHandler";
import { createRaffle, getActiveRaffle, IRaffle } from "../models/Raffle";
import { createRaffleEmbed } from "../utils/createRaffle";

export const data = new SlashCommandBuilder()
  .setName("create_raffle")
  .setDescription("Create Raffle")
  .addChannelOption(
    new SlashCommandChannelOption()
      .setName("channel")
      .setDescription("Desired channel")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText) // Ensure only text channels can be selected
  )
  .addStringOption(
    new SlashCommandStringOption().setName("title").setDescription("Title")
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("description")
      .setDescription("Description")
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("ticket_price")
      .setDescription("Ticket Price")
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("max_ticket")
      .setDescription("Ticket Max")
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    await interaction.deferReply();

    const activeRaffle: IRaffle = await getActiveRaffle();
    if (activeRaffle) {
      return await interaction.followUp({
        content: "There is an active raffle alreadt",
        ephemeral: true,
      });
    }
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const ticketPrice = Number(interaction.options.getNumber("ticket_price"));
    const ticketMax = Number(interaction.options.getNumber("max_ticket"));
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;
    if (isNaN(ticketPrice) || isNaN(ticketMax)) {
      return await interaction.followUp({
        content: "Please enter a valid number",
        ephemeral: true,
      });
    }

    await createRaffle(title, description, ticketPrice, ticketMax);
    const raffle: IRaffle = await getActiveRaffle();

    const { embed, buttons } = await createRaffleEmbed(raffle);
    const message = await channel.send({
      embeds: [embed],
      components: [buttons],
    });
    await interaction.followUp("Raffle has been created!");
  } catch (err) {
    errorHandler(bot, err, "Raffle Create Error");
  }
}
