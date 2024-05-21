import { ExtendedClient } from "../interfaces/ExtendedClient";
import { logHandler } from "./logHandler";
import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, Interaction } from "discord.js";

export const errorHandler = async (
  bot: ExtendedClient,
  err: unknown,
  context: string,
  interaction?:ChatInputCommandInteraction|CommandInteraction
) => {
  const error = err as Error;
  logHandler.log("error", `${context}: ${error.message}`);
  logHandler.log(
    "error",
    `Stack Trace:\n${JSON.stringify(
      error.stack || { stake: "Not Found" },
      null,
      2
    )}`
  );

  if (bot.config.debugHook) {
    const embed = new EmbedBuilder()
      .setColor(0xf1caad)
      .setTitle(`There was an error message in the ${context}`)
      .setDescription(
        `\`\`\`\n${JSON.stringify(
          error.stack || { stake: "Not Found" },
          null,
          2
        )} \n\`\`\``
      )
      .addFields({ name: "Error Message", value: error.message });

    await bot.config.debugHook.send({ embeds: [embed] });
    if (interaction){
      if(interaction.replied || interaction.deferred){
        await interaction.followUp("Something went wrong, please report it.")
      }
      else{
        await interaction.reply("Something went wrong, please report it.")
      }
    }
    
  }
};
