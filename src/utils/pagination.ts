import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Interaction,
  } from "discord.js";
  import { errorHandler } from "../logger/errorHandler";
  import { ExtendedClient } from "../interfaces/ExtendedClient";
  
  export async function pagination(
    interaction: any,
    pages: EmbedBuilder[],
    time = 30 * 1000,
    bot: ExtendedClient
  ) {
    try {
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.deferReply();
      }
  
      let index = 0;
      const first = new ButtonBuilder()
        .setCustomId("pagefirst")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
  
      const prev = new ButtonBuilder()
        .setCustomId("pageprev")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
  
      const pageCount = new ButtonBuilder()
        .setCustomId("pagecount")
        .setLabel(`${index + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
  
      const next = new ButtonBuilder()
        .setCustomId("pagenext")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length <= 1);
  
      const last = new ButtonBuilder()
        .setCustomId("pagelast")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length <= 1);
  
      const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents([
        first,
        prev,
        pageCount,
        next,
        last,
      ]);
  
      const msg = await interaction.editReply({
        embeds: [pages[index]],
        components: [buttons],
        fetchReply: true,
      });
  
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time,
      });
  
      collector.on("collect", async (int) => {
        if (int.user.id !== interaction.user.id) {
          return await int.reply({
            content: `Only ${interaction.user.tag} can interact with these buttons.`,
            ephemeral: true,
          });
        }
  
        await int.deferUpdate();
  
        switch (int.customId) {
          case "pagefirst":
            index = 0;
            break;
          case "pageprev":
            if (index > 0) index--;
            break;
          case "pagenext":
            if (index < pages.length - 1) index++;
            break;
          case "pagelast":
            index = pages.length - 1;
            break;
        }
  
        pageCount.setLabel(`${index + 1}/${pages.length}`);
  
        first.setDisabled(index === 0);
        prev.setDisabled(index === 0);
        next.setDisabled(index === pages.length - 1);
        last.setDisabled(index === pages.length - 1);
  
        const updatedButtons =
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            first,
            prev,
            pageCount,
            next,
            last,
          ]);
  
        await msg.edit({
          embeds: [pages[index]],
          components: [updatedButtons],
        });
  
        collector.resetTimer();
      });
  
      collector.on("end", async () => {
        first.setDisabled(true);
        prev.setDisabled(true);
        next.setDisabled(true);
        last.setDisabled(true);
  
        const disabledButtons =
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            first,
            prev,
            pageCount,
            next,
            last,
          ]);
  
        await msg.edit({
          embeds: [pages[index]],
          components: [disabledButtons],
        });
      });
  
      return msg;
    } catch (err) {
      errorHandler(bot, err, "Pagination Error");
    }
  }
  