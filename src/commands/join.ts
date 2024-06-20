import {
  ChatInputCommandInteraction,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { userModel } from "../models/User";
import { getUserOwnedTokenIds } from "../web3/thirdweb";
import * as web3 from 'web3'
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../logger/errorHandler";

export const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("allows user to join the Builder")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("matic_wallet")
      .setDescription(
        "Enter your Matic wallet so we can keep track of your owned NFTs."
      )
      .setRequired(true)
  );

  export async function execute(bot:ExtendedClient,interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try{let isVerified = false;
    // Retrieve the matic_wallet option value
    const maticWalletOption = interaction.options.getString('matic_wallet');
  
    // Check if the matic_wallet option is present
    if (!maticWalletOption) {
      return await interaction.followUp("Please provide your Matic wallet using the `/join` command.");
    }

    const isUser = await userModel.exists({ discordID: interaction.user.id });
  
    if (isUser) {
      return await interaction.followUp("You are already in the system.");
    }
  
    const tokenIds = await getUserOwnedTokenIds(maticWalletOption);
    const verificationCode = `${interaction.user.id}-${Math.random().toString(36).substring(2, 8)}`;
  
    // Ensure a DM channel is available, and create one if not
    const dmChannel = interaction.user.dmChannel || await interaction.user.createDM();
  
    await dmChannel.send(`To verify, sign the following message in MetaMask: ${verificationCode}\n\nYou can verify by clicking 'Sign Message' here: https://polygonscan.com/verifiedSignatures \nCode for mobile copy paste:`);
    await dmChannel.send(verificationCode);
  
    const dmFilter = (dm) => dm.author.id === interaction.user.id;
    const dmCollector = dmChannel.createMessageCollector({filter:dmFilter, time: 360_000 }); // Adjust time as needed
  

  
    dmCollector.on('collect', async (dm) => {
      const signedMessage = dm.content;
      let recoveredAddress = null;
      try{
      // Verify the signature
       recoveredAddress = web3.eth.accounts.recover(verificationCode, signedMessage);
      }
      catch{
        await dm.author.send('Verification failed. The signed message is not a valid hexadecimal string.');
        return;
      }

      const inputLowered = maticWalletOption.replace(/[A-Z]/g, match => match.toLowerCase());
      const recoverLowered = recoveredAddress.replace(/[A-Z]/g, match => match.toLowerCase());


       console.log(inputLowered);
       console.log(recoverLowered);
       console.log(recoverLowered == inputLowered);
      if (recoverLowered == inputLowered) {
        isVerified = true;
        await userModel.create({
          discordID: interaction.user.id,
          maticAddress: interaction.options.getString('matic_wallet').replace(/[A-Z]/g, match => match.toLowerCase()),
          tokenIds: tokenIds,
          coinsBalance: 0,
        });
  
        await dm.author.send('Verification successful! Your Discord account is linked with your Ethereum wallet.');
        dmCollector.stop();
      } else {
        await dm.author.send('Verification failed. Make sure you signed the correct message in MetaMask.');
      }
  
    });

    dmCollector.on('end',async (dm)=>{
      if(isVerified){
        await interaction.followUp("Verified successfully!");
        await dmChannel.send('Verified successfully!');
        return
      }
      await interaction.followUp("Timeout. Please try later.")
      await dmChannel.send('Timeout. Please try later.')

    })
}
catch(err){
  await interaction.followUp("Something went wrong. Please make sure you have DMs enabled.");
  errorHandler(bot,err,"Joinning Error");
}
  }
  