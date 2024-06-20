import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import * as ShopUtils from "../models/Shop";
import { isAdmin } from "../utils/isAdmin";

export const data = new SlashCommandBuilder()
  .setName("add_shop_item")
  .setDescription("Add Shop Item")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("item_name")
      .setDescription("Item Name")
      .setRequired(true)
  )
  .addStringOption(
    new SlashCommandStringOption()
      .setName("price")
      .setDescription("Item price")
      .setRequired(true)
  )
  .addNumberOption(
    new SlashCommandNumberOption()
      .setName("stock")
      .setDescription("Item stock")
      .setRequired(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply();
  const itemName: string = interaction.options.getString("item_name");
  const itemPrice: string = interaction.options.getString("price");
  const itemStock: number = interaction.options.getNumber("stock");
  if(!(await isAdmin(interaction)))
    return;
  try {
    
    // Create a new role with the item name
    const role = await interaction.guild.roles.create({
      name: itemName,
      reason: `Role created for shop item: ${itemName}`,
    });

    // Add the new shop item with the role ID
    const success = await ShopUtils.addItem(
      itemName,
      Number(itemPrice),
      Number(itemStock),
      role.id,
      bot
    );

    if (success) {
      await interaction.followUp(
        `${itemName} has been added to the shop for ${itemPrice} with role ${role.name}`
      );
    } else {
      await interaction.followUp(`Something went wrong :(`);
    }
  } catch (error) {
    console.error("Error creating role or adding item:", error);
    await interaction.followUp(`Failed to create role or add item: ${error.message}`);
  }
}
