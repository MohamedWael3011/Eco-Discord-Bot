import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import * as ShopUtils from "../models/Shop";
import { errorHandler } from "../logger/errorHandler";
import { removeRoleFromGuild } from "../utils/roleUtils";
import { isAdmin } from "../utils/isAdmin";

export const data = new SlashCommandBuilder()
  .setName("remove_shop_item")
  .setDescription("Remove Shop Item")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("item_name")
      .setDescription("Item Name")
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    if(!(await isAdmin(interaction)))
      return;
    await interaction.deferReply();
    const itemName: string = interaction.options.getString("item_name");
    const allShopItems = await ShopUtils.getAllItems(bot);
    const itemNameChoice = allShopItems.find(
      (item) => item.itemName === itemName
    );

    if (!itemNameChoice) {
      await interaction.followUp("Item not found in the shop.");
      return;
    }

    // Remove the role associated with the shop item
    const roleToRemoveId = itemNameChoice.roleId;
    const guild = interaction.guild;
    const roleToRemove = guild.roles.cache.get(roleToRemoveId);

    await ShopUtils.removeItem(itemNameChoice.itemName, bot);

    if (roleToRemove) {
      // Remove the role from the guild
      await removeRoleFromGuild(guild, roleToRemoveId);

      await interaction.followUp(
        `${itemName} has been removed from the shop, and the associated role has been removed.`
      );
    } else {
      await interaction.followUp(
        `${itemName} has been removed from the shop, but the associated role was not found.`
      );
    }
  } catch (error) {
    errorHandler(bot, error, "Removing Shop Item");
    await interaction.followUp(
      "An error occurred while removing the shop item."
    );
  }
}
