import { schedule } from "node-cron";
import { pickWinner, Raffle } from "../models/Raffle";
import { ExtendedClient } from "../interfaces/ExtendedClient";

export async function EndRaffles(bot: ExtendedClient) {
  schedule("* * * * *", async () => {
    const activeRaffles = await Raffle.find({ isActive: true });
    const now = new Date();
    for (const raffle of activeRaffles) {
      if (now > raffle.endDate) {
        await raffle.save();

        await pickWinner(bot);
      }
    }
  });
}
