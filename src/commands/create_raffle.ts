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
import { addDays } from "date-fns";
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
      .addChannelTypes(ChannelType.GuildText)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("title")
      .setDescription("Title")
      .setRequired(true)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("description")
      .setDescription("Description")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("ticket_price")
      .setDescription("Ticket Price")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("max_ticket")
      .setDescription("Ticket Max")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("duration_days")
      .setDescription("Duration in days")
      .setRequired(true)
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
        content: "There is an active raffle already",
        ephemeral: true,
      });
    }

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const ticketPrice = Number(interaction.options.getNumber("ticket_price"));
    const ticketMax = Number(interaction.options.getNumber("max_ticket"));
    const durationDays = Number(interaction.options.getNumber("duration_days"));
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;

    if (isNaN(ticketPrice) || isNaN(ticketMax) || isNaN(durationDays)) {
      return await interaction.followUp({
        content: "Please enter a valid number",
        ephemeral: true,
      });
    }

    const endDate = addDays(new Date(), durationDays);

    const raffle = await createRaffle(
      title,
      description,
      ticketPrice,
      ticketMax,
      endDate,
      channel
    );

    const { embed, buttons } = await createRaffleEmbed(raffle);
    const message = await channel.send({
      embeds: [embed],
      components: [buttons],
    });

    raffle.messageId = message.id; // Save message ID
    await raffle.save();

    await interaction.followUp("Raffle has been created!");
  } catch (err) {
    errorHandler(bot, err, "Raffle Create Error");
  }
}
