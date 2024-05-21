import { Client, Events } from "discord.js";
import { IntentOptions } from "./config/IntentOptions";
import { ExtendedClient } from "./interfaces/ExtendedClient";
import { handleEvents } from "./events/HandleEvents";
import { config } from "dotenv";
import { connectDB } from "./database/connectDB";
import * as CommandModules from "./commands";
import { errorHandler } from "./logger/errorHandler";
import { validateEnv } from "./logger/validateEnv";


config();

const commands = Object(CommandModules);

(async () => {
  const client = new Client({ intents: IntentOptions }) as ExtendedClient;
  validateEnv(client);
  client.cache = {};
  handleEvents(client);
  //await connectDB(client);
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
  
    // Debugging: Log the command name
    console.log("Received command:", commandName);
  
    // Check if the command exists before executing
    if (commands[commandName]) {
      commands[commandName].execute(client, interaction);
    } else {
      console.error(`Command '${commandName}' not found.`);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    const focusedOption = interaction.options.getFocused(true);
    //! For the autoComplete feature 
  });
  await client
    .login(process.env.TOKEN)
    .catch((err) => errorHandler(client, err, "login"));
})();
