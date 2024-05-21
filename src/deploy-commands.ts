import { REST, Routes } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";
import * as commandModules from "./commands";
import { ICommand } from "./interfaces/ICommand";
import { ExtendedClient } from "./interfaces/ExtendedClient";
config();

export const loadCommands = (bot:ExtendedClient)=>{
const commands = [];
for (const module of Object.values<ICommand>(commandModules)) {
  commands.push(module.data);
}
// bot.commands.data = commands;
const rest = new REST().setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands("1242440725694779473"), { body: commands }).then(()=>console.log("All Slash Commands Has been Loaded!"));
}