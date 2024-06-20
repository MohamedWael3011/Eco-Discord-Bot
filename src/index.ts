import {
  ActionRowBuilder,
  Client,
  ComponentType,
  EmbedBuilder,
  Events,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { IntentOptions } from "./config/IntentOptions";
import { ExtendedClient } from "./interfaces/ExtendedClient";
import { handleEvents } from "./events/HandleEvents";
import { config } from "dotenv";
import { connectDB } from "./database/connectDB";
import * as CommandModules from "./commands";
import { errorHandler } from "./logger/errorHandler";
import { validateEnv } from "./logger/validateEnv";
import { getAllItems } from "./models/Shop";
import shopMenuBuilder from "./utils/menu";
import {
  addBalance,
  addBankBalance,
  getBalance,
  getBankBalance,
  removeBalance,
  removeBankBalance,
  userModel,
} from "./models/User";
import { bankEmbedBuilder } from "./utils/bankEmbedBalance";
import { isNumber } from "./utils/isNumber";
import { Config, initializeConfig, Reward } from "./models/Rewards";

config();
const COOLDOWN_TIME = 60000;
const commands = Object(CommandModules);
const messageCooldowns = new Map();
(async () => {
  const client = new Client({ intents: IntentOptions }) as ExtendedClient;
  validateEnv(client);
  client.cache = {};
  handleEvents(client);
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();
    const timestamps = messageCooldowns.get(userId);

    if (!timestamps || now - timestamps >= COOLDOWN_TIME) {
      // Reward the user
      const isUser = await userModel.exists({ discordID: userId });
      if (isUser) {
        const config = await Config.findOne({ name: "default" });

        await addBalance(userId, config.rewardRateMessage);

        // Update the timestamp
        messageCooldowns.set(userId, now);
      }
    }
  });

  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    // Replace with your channel ID
    if (!client.cache.announcement_channel) {
      const config = await Config.findOne({ name: "default" });
      client.cache.announcement_channel = config.announcementChannel;
    }
    const AANNOUNCEMENT_CHAT = client.cache.announcement_channel;

    // Check if the reaction is from thea specific channel
    if (reaction.message.channel.id !== AANNOUNCEMENT_CHAT) return;

    const rewardKey = { userId: user.id, messageId: reaction.message.id };

    try {
      const reward = await Reward.findOne(rewardKey);
      const config = await Config.findOne({ name: "default" });

      if (!reward) {
        // Reward the user
        const isUser = await userModel.exists({ discordID: user.id });
        if (isUser) {
          await addBalance(user.id, Number(config.rewardRateReaction));
          // Save the reward information to the database
          const newReward = new Reward(rewardKey);
          await newReward.save();
        }
      }
    } catch (error) {
      console.error("Error checking or saving reward:", error);
    }
  });
  await connectDB(client);
  await initializeConfig();
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

  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.type == InteractionType.MessageComponent) {
        if (interaction.customId == "preview_shop") {
          await shopMenuBuilder(client, interaction);
        }
        if (interaction.customId == "view_balance") {
          const balance = await getBalance(interaction.user.id);
          await interaction.reply({
            content: `Your current balance is ${balance.toString()}`,
            ephemeral: true,
          });
        }
        if (interaction.customId === "view_bankbalance") {
          const bankEmbed = await bankEmbedBuilder(
            interaction.client as ExtendedClient,
            interaction.user.id
          );
          await interaction.reply({ embeds: [bankEmbed], ephemeral: true });
        } else if (interaction.customId === "add_balance") {
          try {
            const modal = new ModalBuilder({
              custom_id: `bank_addbalance-${interaction.user.id}`,
              title: "Add Bank Balance",
            });
            const inputField = new TextInputBuilder({
              custom_id: "bank_balance_input",
              label: "Input the balance you want to add to bank",
              style: TextInputStyle.Short,
            });
            const actionRow =
              new ActionRowBuilder<TextInputBuilder>().addComponents(
                inputField
              );
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
            const filter = (interaction) =>
              interaction.customId === `bank_addbalance-${interaction.user.id}`;
            interaction
              .awaitModalSubmit({ filter, time: 60_000 })
              .then(async (modalInteraction) => {
                await modalInteraction.deferReply();
                const balanceToAdd =
                  modalInteraction.fields.getTextInputValue(
                    "bank_balance_input"
                  );
                if (!isNumber(balanceToAdd)) {
                  return await modalInteraction.followUp({
                    content: "Please enter a valid number",
                    ephemeral: true,
                  });
                }
                const userBalance = await getBalance(modalInteraction.user.id);
                if (Number(balanceToAdd) > Number(userBalance)) {
                  return modalInteraction.followUp({
                    content: `Your balance is only ${userBalance} you cant add ${balanceToAdd} to bank`,
                    ephemeral: true,
                  });
                }
                const discordUser = await modalInteraction.guild.members.fetch(
                  modalInteraction.user.id
                );
                const userRoles = discordUser.roles.cache.map((r) => r.id);
                if (
                  (await addBankBalance(
                    modalInteraction.user.id,
                    Number(balanceToAdd),
                    userRoles
                  )) &&
                  (await removeBalance(
                    modalInteraction.user.id,
                    Number(balanceToAdd)
                  ))
                )
                  await modalInteraction.followUp({
                    content: `Balance was added Successfully!`,
                    ephemeral: true,
                  });
                else
                  await modalInteraction.followUp({
                    content: `Something went wrong, please try again.`,
                    ephemeral: true,
                  });
              });
          } catch (err) {
            errorHandler(client, err, "Adding Balance");
          }
        } else if (interaction.customId === "remove_balance") {
          try {
            const modal = new ModalBuilder({
              custom_id: `bank_removebalance-${interaction.user.id}`,
              title: "Remove Bank Balance",
            });
            const inputField = new TextInputBuilder({
              custom_id: "bank_balance_input",
              label: "Input the balance to be removed",
              style: TextInputStyle.Short,
            });
            const actionRow =
              new ActionRowBuilder<TextInputBuilder>().addComponents(
                inputField
              );
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
            const filter = (interaction) =>
              interaction.customId ===
              `bank_removebalance-${interaction.user.id}`;
            interaction
              .awaitModalSubmit({ filter, time: 60_000 })
              .then(async (modalInteraction) => {
                await modalInteraction.deferReply();
                const balanceToRemove =
                  modalInteraction.fields.getTextInputValue(
                    "bank_balance_input"
                  );
                if (!isNumber(balanceToRemove)) {
                  return await modalInteraction.followUp({
                    content: "Please enter a valid number",
                    ephemeral: true,
                  });
                }
                const userBankBalance = await getBankBalance(
                  modalInteraction.user.id
                );
                if (Number(balanceToRemove) > Number(userBankBalance))
                  return await modalInteraction.followUp({
                    content:
                      "You cannot withrdaw more than the amount that you have.",
                    ephemeral: true,
                  });
                const discordUser = await modalInteraction.guild.members.fetch(
                  modalInteraction.user.id
                );
                if (
                  (await removeBankBalance(
                    modalInteraction.user.id,
                    Number(balanceToRemove)
                  )) &&
                  (await addBalance(
                    modalInteraction.user.id,
                    Number(balanceToRemove)
                  ))
                )
                  await modalInteraction.followUp({
                    content: `Balance was removed Successfully!`,
                    ephemeral: true,
                  });
                else
                  await modalInteraction.followUp({
                    content: `Something went wrong, please try again.`,
                    ephemeral: true,
                  });
              });
          } catch (err) {
            errorHandler(client, err, "Removing Balance");
          }
        }
      }
    } catch (err) {
      errorHandler(client, err, "Interaction Errors");
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    const focusedOption = interaction.options.getFocused(true);
    //! For the autoComplete feature

    try {
      if (
        interaction.commandName == "remove_shop_items" ||
        interaction.commandName == "add_stock"
      ) {
        const itemName = interaction.options.getString("item_name");
      }
      if (focusedOption.name == "item_name") {
        const allItems = await getAllItems(client);
        const allChoices = allItems.map((item) => ({
          name: item.itemName,
          value: item.itemName,
        }));
        const filteredChoices = allChoices.filter((item) =>
          item.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        );
        interaction.respond(filteredChoices.slice(0, 25)).catch(() => {});
      }
    } catch (err) {
      errorHandler(client, err, "Interaction Errors");
    }
  });
  await client
    .login(process.env.TOKEN)
    .catch((err) => errorHandler(client, err, "login"));
})();
