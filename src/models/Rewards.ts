import { model, Schema } from "mongoose";

export const rewardSchema = new Schema({
  userId: String,
  messageId: String,
  rewardedAt: { type: Date, default: Date.now },
});

export const configSchema = new Schema({
  name: String,
  rewardRateMessage: Number,
  rewardRateReaction: Number,
  adminChannel: String,
  announcementChannel: String,
});

export const Reward = model("Reward", rewardSchema);
export const Config = model("Config", configSchema);

export async function initializeConfig() {
  const config = await Config.findOne({ name: "default" });
  if (!config) {
    const newConfig = new Config({
      name: "default",
      rewardRateMessage: 10, // Example reward rate for messages
      rewardRateReaction: 5, // Example reward rate for reactions
      adminChannel: "",
      announcementChannel: "",
    });
    await newConfig.save();
  }
}
export async function updateAdminChannel(newChannel) {
  try {
    const config = await Config.findOne({ name: "default" });

    if (config) {
      config.adminChannel = newChannel;
      await config.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating reward rates:", error);
    return false;
  }
}

export async function updadeAnnouncementChannel(newChannel) {
  try {
    const config = await Config.findOne({ name: "default" });

    if (config) {
      config.announcementChannel = newChannel;
      await config.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating reward rates:", error);
    return false;
  }
}

export async function updateMessageRewardRates(newMessageRate) {
  try {
    const config = await Config.findOne({ name: "default" });

    if (config) {
      config.rewardRateMessage = newMessageRate;
      await config.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating reward rates:", error);
    return false;
  }
}

export async function updateReactRewardRates(newReactRate) {
  try {
    const config = await Config.findOne({ name: "default" });

    if (config) {
      config.rewardRateReaction = newReactRate;
      await config.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating reward rates:", error);
    return false;
  }
}
