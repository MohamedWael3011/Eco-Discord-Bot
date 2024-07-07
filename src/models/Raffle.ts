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
  maxTickets: { type: Number, required: true }, // Add this line
  isActive: { type: Boolean, default: true },
});

export const Raffle = mongoose.model<IRaffle>("Raffle", RaffleSchema);

// Example to create a raffle (you might trigger this with a command)
export const createRaffle = async (
  title,
  description,
  ticketPrice,
  maxTickets
) => {
  const newRaffle = new Raffle({
    title,
    description,
    ticketPrice,
    maxTickets,
    participants: [],
    isActive: true,
  });

  await newRaffle.save();
};

export const getActiveRaffle = async () => {
  return await Raffle.findOne({ isActive: true });
};

export const pickWinner = async () => {
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

  raffle.isActive = false;
  await raffle.save();

  return winner;
};

export const buyTicket = async (userId: string, ticketCount: number) => {
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
    return await pickWinner(); // Automatically pick a winner
  } else {
    await raffle.save();
  }
};
