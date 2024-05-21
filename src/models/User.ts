import mongoose, { Document, model, Schema } from "mongoose";

// Define a custom validator to allow duplicate entries in the array
const allowDuplicatesValidator = function(value: string[]) {
  // Allow any values
  return true;
};

const userSchema = new Schema({
  discordID: { type: String, required: true, unique: true },
  maticAddress: { type: String, required: true, unique: true },
  tokenIds: [String],
  coinsBalance: mongoose.Types.Decimal128,
});

export const userModel = model("User", userSchema);

export async function getMaticAddress(discordID: string) {
  const user = await userModel.findOne({ discordID: discordID });
  return user?.maticAddress;
}

export async function getDiscordUser(maticWallet: string) {
  const user = await userModel.findOne({ maticAddress: maticWallet });
  return user?.discordID;
}

export async function getBalance(discordID: string) {
  const user = await userModel.findOne({ discordID: discordID });
  return user?.coinsBalance || 0;
}

export async function addBalance(wallet: string, amount: any) {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { maticAddress: wallet },
      { $inc: { coinsBalance: amount } },
      { new: true }
    );

    return updatedUser?.coinsBalance || false;
  } catch (error) {
    console.error("Error adding balance to user:", error);
    return false;
  }
}

export async function removeBalance(discordID: string, amount: number) {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { discordID: discordID },
      { $inc: { coinsBalance: -amount } },
      { new: true }
    );

    return updatedUser?.coinsBalance || false;
  } catch (error) {
    console.error("Error removing balance from user:", error);
    return false;
  }
}