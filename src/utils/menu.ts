import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { getAllItems } from "../models/Shop";
import buyItem from "./buyItem";
import { errorHandler } from "../logger/errorHandler";

let listenersAdded = false;

export default async function shopMenuBuilder(bot, interaction) {
  const items = await getAllItems(bot);

  if (!items || items.length === 0) {
    await interaction.reply("No items available in the shop.");
    return;
  }

  const options = items.map((item) => ({
    label: item.itemName,
    description: `Price: ${item.price.toString()}, Stock: ${item.stock}`,
    value: item._id.toString(),
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("shopmenu")
    .setPlaceholder("Select a Shop Item")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      options.map((item) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(item.label)
          .setDescription(item.description)
          .setValue(item.value)
      )
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);
  await interaction.reply({
    content: "Select an item from the shop:",
    components: [row],
    ephemeral: true,
  });

  if (!listenersAdded) {
    listenersAdded = true;

    // Event listener for select menu interaction
    bot.on("interactionCreate", async (interaction) => {
      try{
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId === "shopmenu") {
          const selectedValue = interaction.values[0];
          const selectedItem = items.find(
            (item) => item._id.toString() === selectedValue
          );
  
          const confirmButton = new ButtonBuilder()
            .setCustomId(`confirmPurchase_${selectedItem._id}`)
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Primary);
  
          const cancelButton = new ButtonBuilder()
            .setCustomId("cancelPurchase")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);
  
          const buttonRow = new ActionRowBuilder().addComponents(
            confirmButton,
            cancelButton
          );
  
          await interaction.update({
            content: `Do you want to buy **${selectedItem.itemName}** for **${selectedItem.price}**?`,
            components: [buttonRow],
            ephemeral: true,
          });
        }
      }
      catch(err){
        errorHandler(bot,err,"Interaction Error")
      }
      
    });

    // Event listener for button interaction
    bot.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId.startsWith("confirmPurchase_")) {
        const itemId = interaction.customId.split("_")[1];
        const selectedItem = items.find(
          (item) => item._id.toString() === itemId
        );

        if (selectedItem) {
          // Acknowledge the interaction before proceeding
          await interaction.deferUpdate();
          // Perform the purchase logic
          const purchaseResult = await buyItem(
            interaction,
            bot,
            selectedItem.itemName
          );

          // Update the original message, removing buttons
          await interaction.deleteReply();
        } else {
          await interaction.deferUpdate();
          await interaction.editReply({
            content: "Item not found. Purchase failed.",
            components: [],
          });
        }
      } else if (interaction.customId === "cancelPurchase") {
        // Acknowledge the interaction before proceeding
        await interaction.deferUpdate();
        // Update the original message, removing buttons
        await interaction.editReply({
          content: "Purchase cancelled.",
          components: [],
        });
      }
    });
  }
}
