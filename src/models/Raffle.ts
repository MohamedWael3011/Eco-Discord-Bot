import mongoose, { Schema, Document } from "mongoose";

interface IParticipant {
  userId: string;
  ticketCount: number;
}

export interface IRaffle extends Document {
  title: string;
  description: string;
  participants: IParticipant[];
  ticketPrice: number;
  maxTickets: number;
  isActive: boolean;
  endDate: Date;
  messageId: string;
  channelId: string;
}

const ParticipantSchema: Schema = new Schema({
  userId: { type: String, required: true },
  ticketCount: { type: Number, required: true, default: 1 },
});

const RaffleSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  participants: { type: [ParticipantSchema], default: [] },
  ticketPrice: { type: Number, required: true },
  maxTickets: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  endDate: { type: Date, required: true },
  messageId: { type: String }, // Add this line
  channelId: { type: String }, // Add this line
});

export const Raffle = mongoose.model<IRaffle>("Raffle", RaffleSchema);

// Example to create a raffle (you might trigger this with a command)
import { EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";

export const createRaffle = async (
  title: string,
  description: string,
  ticketPrice: number,
  maxTickets: number,
  endDate: Date,
  channel: TextChannel
) => {
  const newRaffle = new Raffle({
    title,
    description,
    ticketPrice,
    maxTickets,
    participants: [],
    isActive: true,
    endDate,
    channelId: channel.id, // Save channel ID
  });

  await newRaffle.save();
  return newRaffle;
};

export const getActiveRaffle = async () => {
  return await Raffle.findOne({ isActive: true });
};

export const pickWinner = async (bot: ExtendedClient) => {
  const raffle = await getActiveRaffle();
  if (!raffle || !raffle.isActive) {
    throw new Error("Raffle not found or not active");
  }

  const totalTickets = raffle.participants.reduce(
    (acc, participant) => acc + participant.ticketCount,
    0
  );

  const ticketArray = raffle.participants.flatMap((participant) =>
    Array(participant.ticketCount).fill(participant.userId)
  );

  const winnerIndex = Math.floor(Math.random() * totalTickets);
  const winner = ticketArray[winnerIndex];

  const channel = (await bot.channels.fetch(raffle.channelId)) as TextChannel;
  const message = await channel.messages.fetch(raffle.messageId);
  raffle.isActive = false;
  await raffle.save();
  await channel.send({
    content: `<@${winner}> has won the ${raffle.title} Raffle. Congrats!`,
  });
  const embed = new EmbedBuilder()
    .setTitle(raffle.title)
    .setDescription(raffle.description)
    .addFields(
      { name: "Ticket Price", value: `${raffle.ticketPrice} coins` },
      { name: "Winner:", value: `<@${winner}>` }
    );
  await message.edit({
    embeds: [embed],
  });

  return winner;
};

export const buyTicket = async (
  userId: string,
  ticketCount: number,
  bot: ExtendedClient
) => {
  const raffle = await getActiveRaffle();
  if (!raffle || !raffle.isActive) {
    throw new Error("Raffle not found or not active");
  }

  const currentTickets = raffle.participants.reduce(
    (acc, participant) => acc + participant.ticketCount,
    0
  );

  if (currentTickets + ticketCount > raffle.maxTickets) {
    throw new Error("Exceeds maximum ticket count");
  }

  const participant = raffle.participants.find((p) => p.userId === userId);
  if (participant) {
    participant.ticketCount += ticketCount;
  } else {
    raffle.participants.push({ userId, ticketCount });
  }

  if (currentTickets + ticketCount === raffle.maxTickets) {
    return await pickWinner(bot); // Automatically pick a winner
  } else {
    await raffle.save();
  }
};
