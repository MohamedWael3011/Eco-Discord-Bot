import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  TextChannel,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import * as ShopUtils from "../models/Shop";
import { isAdmin } from "../utils/isAdmin";

export const data = new SlashCommandBuilder()
  .setName("add_stock")
  .setDescription("Purchase an item from shop")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("item_name")
      .setDescription("Item Name")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("stock")
      .setDescription("Stock")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  if(!(await isAdmin(interaction)))
    return;
  const itemName: string = interaction.options.getString("item_name");
  const allShopItems = await ShopUtils.getAllItems(bot);
  const itemNameChoice = allShopItems.find(
    (item) => item.itemName === itemName
  );
  const stock = interaction.options.getNumber("stock");
  await ShopUtils.addStock(itemNameChoice.itemName, Number(stock), bot);

  return await interaction.reply({content:`A stock of ${stock} has been added to ${itemNameChoice.itemName}`, ephemeral:true})
}
