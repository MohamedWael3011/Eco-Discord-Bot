import { TextChannel } from "discord.js";
import { ADMIN_CHAT } from "../consts/channels";
import { getBalance, removeBalance, userModel } from "../models/User";
import * as ShopUtils from "./../models/Shop";
import { errorHandler } from "../logger/errorHandler";
export default async function buyItem(
  interaction,
  bot,
  itemName
): Promise<boolean> {
  try {
    // Check if User
    const isUser = await userModel.exists({ discordID: interaction.user.id });
    if (!isUser)
      return await interaction.followUp({
        content: "Please join the system from `/join` command",
        ephemeral: true,
      });

    // Check for stock
    const item = await ShopUtils.getItem(itemName, bot);

    if (!item[0].stock) {
      await interaction.followUp({
        content: "Item is out of stock",
        ephemeral: true,
      });
      return false;
    }

    // Check for balance
    const userBalance = await getBalance(interaction.user.id);

    if (Number(userBalance) < Number(item[0].price)) {
      await interaction.followUp({
        content: "You don't have enough balance",
        ephemeral: true,
      });
      return false;
    }

    // Remove Stock
    const isStockRemoved = await ShopUtils.removeStock(
      item[0].itemName,
      1,
      bot
    );

    // Remove Balance
    const isBalanceRemoved = await removeBalance(
      interaction.user.id,
      Number(item[0].price)
    );

    if (isStockRemoved && isBalanceRemoved) {
      // Add Role to the user
      const guild = interaction.guild;
      const member = await guild.members.fetch(interaction.user.id);
      const role = guild.roles.cache.get(item[0].roleId); // Assuming roleId is stored with the item
      if (role) {
        await member.roles.add(role);
        await interaction.followUp(
          `${item[0].itemName} has been purchased successfully and you have been assigned the ${role.name} role. Please open a ticket to claim the item!`
        );

        const adminChat = (await bot.channels.fetch(ADMIN_CHAT)) as TextChannel;
        await adminChat.send(
          `<@${interaction.user.id}> has purchased ${item[0].itemName}`
        );
        return true;
      } else {
        await interaction.followUp(
          `${item[0].itemName} has been purchased successfully, but there was an issue assigning the role. Please contact an admin.`
        );
        return false;
      }
    } else {
      await interaction.followUp(
        "Something went wrong with your purchase. Please try again."
      );
      return false;
    }
  } catch (err) {
    errorHandler(bot, err, " Buy Item Error");
    return false;
  }
}
