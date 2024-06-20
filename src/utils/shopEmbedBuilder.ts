import { EmbedBuilder } from "discord.js";
import { getAllItems } from "../models/Shop";
import { ExtendedClient } from "../interfaces/ExtendedClient";

export async function shopEmbedBuilder(bot: ExtendedClient) {
  const items = await getAllItems(bot); // Fetch items from your database or data source
  const itemsPages = [];
  for (var i = 0; i < items.length / 5; i++) {
    const fields = [];

    for (var j = 0; j < 5; j++) {
      if (i*5 + j < items.length) {
        fields.push(
          { name: "Item Name", value: items[i*5 + j].itemName, inline: true },
          {
            name: "Price",
            value: items[i*5 + j].price.toString(),
            inline: true,
          },
          { name: "\u200b", value: "\u200b" }
        );
      }
    }
    itemsPages.push(
        new EmbedBuilder()
          .setTitle("Store Items 🛒")
          .setDescription("Here is a list of all items available!")
          .addFields(...fields)
      );
  }

  return itemsPages;
}
