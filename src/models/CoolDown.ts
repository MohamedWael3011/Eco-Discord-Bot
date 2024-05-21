import mongoose, { Document, model, Schema } from "mongoose";

// Define the cooldown schema
const cooldownSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  timestamps: [Number], // Store timestamps for each cooldown
});

// Create a model for the cooldown schema
const cooldownModel = model("Cooldown", cooldownSchema);

// Function to load cooldown data from the database
export async function loadCooldowns() {
  try {
    const cooldowns = await cooldownModel.find({});
    return cooldowns.reduce((map, cooldown) => {
      map.set(cooldown.userId, cooldown.timestamps);
      return map;
    }, new Map<string, number[]>());
  } catch (error) {
    console.error("Error loading cooldowns:", error);
    return new Map<string, number[]>();
  }
}


export async function updateUserCooldown(userCooldowns,userId: string, timestamp: number,cooldownLimit) {
    let timestamps = userCooldowns.get(userId) || [];
    timestamps.push(timestamp);
    // Ensure only the last `cooldownLimit` timestamps are kept to maintain the cooldown limit
    timestamps = timestamps.slice(-cooldownLimit);
    userCooldowns.set(userId, timestamps);
    await updateCooldowns(userId, timestamps);
  }

// Function to update cooldown data in the database
export async function updateCooldowns(userId: string, timestamps: number[]) {
  try {
    await cooldownModel.findOneAndUpdate(
      { userId: userId },
      { timestamps: timestamps },
      { upsert: true } // Create a new document if it doesn't exist
    );
  } catch (error) {
    console.error("Error updating cooldowns:", error);
  }
}

// Example function to start a cooldown for a user
export function startCooldown(userCooldowns,userId: string, timestamp: number) {
  
  const timestamps = userCooldowns.get(userId) || [];
  timestamps.push(timestamp);
  userCooldowns.set(userId, timestamps);
  updateCooldowns(userId, timestamps);
}

// Example function to check if a user is on cooldown
export function isOnCooldown(userCooldowns,userId: string, cooldownLimit: number, cooldownDuration: number): boolean {
  const timestamps = userCooldowns.get(userId) || [];
  const currentTime = Date.now();
  return (
    timestamps.length >= cooldownLimit &&
    currentTime - timestamps[0] < cooldownDuration
  );
}
