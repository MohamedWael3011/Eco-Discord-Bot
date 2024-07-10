import { Interaction } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { buyTicket, getActiveRaffle, Raffle } from "../models/Raffle";
import { getBalance, removeBalance } from "../models/User";
import { errorHandler } from "../logger/errorHandler";
import { createRaffleEmbed } from "../utils/createRaffle";

export const raffleEvents = (client: ExtendedClient) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const raffle = await Raffle.findOne({ isActive: true });
    if (!raffle) {
      await interaction.reply("No active raffle.");
      return;
    }

    if (interaction.customId === "show_participants") {
      const participantList =
        raffle.participants
          .map((p) => `<@${p.userId}>: ${p.ticketCount} ticket(s)`)
          .join("\n") || "No participants yet.";
      await interaction.reply({
        content: `**Participants:**\n${participantList}`,
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === "buy_ticket") {
      try {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.user.id;
        const balance = await getBalance(user);
        const raffle = await getActiveRaffle();
        if (Number(balance) < raffle.ticketPrice) {
          await interaction.followUp({
            content: "You do not have enough cash",
            ephemeral: true,
          });
          return;
        }
        const isReduced = await removeBalance(user, raffle.ticketPrice);
        if (isReduced) {
          await buyTicket(user, 1, client);
          await interaction.followUp({
            content: "Ticket purchased successfully!",
            ephemeral: true,
          });
          const updatedRaffle = await getActiveRaffle(); // Fetch the updated raffle
          const { embed, buttons } = createRaffleEmbed(updatedRaffle);
          await interaction.message.edit({
            embeds: [embed],
            components: [buttons],
          });
        }
      } catch (err) {
        errorHandler(client, err, "Buying Ticket");
      }
    }
  });
};
