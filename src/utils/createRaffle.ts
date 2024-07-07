import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { IRaffle } from "../models/Raffle";

export const createRaffleEmbed = (raffle: IRaffle) => {
  const participants = raffle.participants || [];
  let totalTickets = 0;

  if (participants.length !== 0)
    totalTickets = participants.reduce(
      (acc, participant) => acc + participant.ticketCount,
      0
    );

  const embed = new EmbedBuilder()
    .setTitle(raffle.title)
    .setDescription(raffle.description)
    .addFields(
      { name: "Ticket Price", value: `${raffle.ticketPrice} coins` },
      { name: "Total Tickets", value: `${totalTickets} / ${raffle.maxTickets}` }
    );

  const showParticipantButton = new ButtonBuilder()
    .setCustomId("show_participants")
    .setLabel("Show Participants")
    .setStyle(ButtonStyle.Primary);
  const buyTicketButton = new ButtonBuilder()
    .setCustomId("buy_ticket")
    .setLabel("Buy Ticket")
    .setStyle(ButtonStyle.Success);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
    showParticipantButton,
    buyTicketButton,
  ]);

  return { embed, buttons };
};
