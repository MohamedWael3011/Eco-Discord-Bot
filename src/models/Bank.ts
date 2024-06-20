import { model, Schema } from "mongoose";

const bankSchema = new Schema({
  discordRoleId: { type: String, required: true, unique: true },
  monthlyInterestRate: { type: Number, required: true },
});

export const bankModel = model("Bank", bankSchema);

export async function addBankData(
  discordRoleId: string,
  monthlyInterestRate: number
): Promise<boolean> {
  try {
    // Create a new document for the bank data
    const newBankData = new bankModel({
      discordRoleId: discordRoleId,
      monthlyInterestRate: monthlyInterestRate,
    });

    // Save the document to the database
    await newBankData.save();

    // Return true to indicate success
    return true;
  } catch (error) {
    // Log and handle errors
    console.error("Error adding bank data:", error);
    return false;
  }
}
