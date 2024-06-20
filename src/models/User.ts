import mongoose, { Document, model, Schema } from "mongoose";
import { bankModel } from "./Bank";
import { getUserOwnedTokenIds } from "../web3/thirdweb";

// Define a custom validator to allow duplicate entries in the array
const allowDuplicatesValidator = function (value: string[]) {
  // Allow any values
  return true;
};

const userSchema = new Schema({
  discordID: { type: String, required: true, unique: true },
  maticAddress: { type: String, required: true, unique: true },
  stakedTokenIds: { type: [String], default: [] },
  coinsBalance: Number,
  bankBalance: Number,
  bankDateUpdate: Date,
});

export const userModel = model("User", userSchema);

export async function stakeNFT(discordID: string, tokenId: string) {
  try {
    const user = await userModel.findOne({ discordID: discordID });
    if (!user) {
      throw new Error("User not found");
    }
    const userOwnedNFTs = await getUserOwnedTokenIds(user.maticAddress);
    if (
      userOwnedNFTs.includes(tokenId) &&
      !user.stakedTokenIds.includes(tokenId)
    ) {
      user.stakedTokenIds.push(tokenId);
      await user.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error staking NFT:", error);
    return false;
  }
}

export async function unstakeNFT(discordID: string, tokenId: string) {
  try {
    const user = await userModel.findOne({ discordID: discordID });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.stakedTokenIds.includes(tokenId)) {
      user.stakedTokenIds = user.stakedTokenIds.filter((id) => id !== tokenId);
      await user.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error unstaking NFT:", error);
    return false;
  }
}
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

export async function addBalance(discordId: string, amount: any) {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { discordID: discordId },
      { $inc: { coinsBalance: amount } },
      { new: true }
    );

    return Number(updatedUser?.coinsBalance) ? true : false;
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

    return true;
  } catch (error) {
    console.error("Error removing balance from user:", error);
    return false;
  }
}

// New functions
export async function getBankBalance(discordID: string) {
  const user = await userModel.findOne({ discordID: discordID });
  return user?.bankBalance || 0;
}

export async function removeBankBalance(discordID: string, amount: number) {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { discordID: discordID },
      { $inc: { bankBalance: -amount } },
      { new: true }
    );

    return true;
  } catch (error) {
    console.error("Error removing bank balance from user:", error);
    return false;
  }
}

export async function addBankBalance(
  discordID: string,
  amount: number,
  userRoles: string[]
) {
  try {
    const user = await userModel.findOne({ discordID: discordID });
    if (!user) {
      throw new Error("User not found");
    }

    const bankDateUpdate = user.bankDateUpdate || new Date();
    const currentDate = new Date();

    // Calculate the number of months between the last update and now
    const monthsDifference =
      (currentDate.getFullYear() - bankDateUpdate.getFullYear()) * 12 +
      (currentDate.getMonth() - bankDateUpdate.getMonth());

    if (monthsDifference > 0) {
      // Get the highest interest rate from the user's roles
      const interestRates = await bankModel
        .find({ discordRoleId: { $in: userRoles } })
        .sort({ monthlyInterestRate: -1 })
        .limit(1);
      const highestInterestRate =
        interestRates.length > 0 ? interestRates[0].monthlyInterestRate : 0;

      // Calculate accumulated interest
      const accumulatedInterest =
        Number(user.bankBalance) *
          Math.pow(1 + highestInterestRate / 100, monthsDifference) -
        Number(user.bankBalance || 0);

      // Update the bank balance with the accumulated interest
      user.bankBalance = Number(user.bankBalance || 0) + accumulatedInterest;
    }

    // Add the new amount to the bank balance
    user.bankBalance = Number(user.bankBalance || 0) + amount;
    user.bankDateUpdate = currentDate;

    await user.save();

    return true;
  } catch (error) {
    console.error("Error adding bank balance to user:", error);
    return false;
  }
}
