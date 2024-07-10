import { loadCommands } from "../deploy-commands";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { EndRaffles } from "../utils/automatedRaffleEndTask";
import { automateSched } from "../utils/automatedStakeTask";

export const handleEvents = (client: ExtendedClient) => {
  client.on("ready", async () => {
    loadCommands(client);
    console.log("Connected to Discord");
    await automateSched(client);
    await EndRaffles(client);
  });
};
