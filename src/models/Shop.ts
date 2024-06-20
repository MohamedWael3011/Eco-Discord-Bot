import mongoose, { Document, model, Schema } from "mongoose";
import { errorHandler } from "../logger/errorHandler";

// Define the schema with itemName being unique
const shopSchema = new Schema({
  itemName: { type: String, unique: true, required: true },
  price: { type: mongoose.Types.Decimal128, required: true },
  stock: { type: Number, default: 0, required: true }, // Added stock field
  roleId: String,
});

// Create the model
export const shopItemsModel = model("shopItems", shopSchema);

// Function to add an item
export const addItem = async (
  itemName: string,
  price,
  stock: number,
  roleId: string,
  bot
) => {
  try {
    const newItem = new shopItemsModel({ itemName, price, stock, roleId });
    await newItem.save();

    return true;
  } catch (error) {
    errorHandler(bot, error, "Adding Item to shop");
    return false;
  }
};

// Function to remove an item by name
export const removeItem = async (itemName: string, bot) => {
  try {
    console.log(itemName);
    const result = await shopItemsModel.deleteOne({ itemName });
    if (result.deletedCount > 0) {
      console.log(`Item ${itemName} removed successfully.`);
    } else {
      console.log(`Item ${itemName} not found.`);
    }
  } catch (error) {
    errorHandler(bot, error, "Removing Item from shop");
  }
};

// Function to get items
export const getItem = async (itemName: string = null, bot) => {
  try {
    let items;
    if (itemName) {
      items = await shopItemsModel.find({ itemName });
    } else {
      items = await shopItemsModel.find();
    }
    return items;
  } catch (error) {
    errorHandler(bot, error, "getting item");

    return null;
  }
};

// Function to get all items
export const getAllItems = async (bot) => {
  try {
    const items = await shopItemsModel.find();
    return items;
  } catch (error) {
    errorHandler(bot, error, "getting all items");

    return null;
  }
};

// Function to check if an item exists
export const itemExists = async (itemName, bot) => {
  try {
    const item = await shopItemsModel.findOne({ itemName });
    const exists = !!item; // Converts the document to a boolean
    return exists;
  } catch (error) {
    errorHandler(bot, error, "checking if item exists");

    return false;
  }
};

export const addStock = async (itemName: string, quantity: number, bot) => {
  try {
    const item = await shopItemsModel.findOne({ itemName });
    if (!item) {
      return false;
    }
    item.stock += quantity;
    await item.save();
    return true;
  } catch (error) {
    errorHandler(bot, error, "Adding Stock");
    return false;
  }
};

export const removeStock = async (itemName: string, quantity: number, bot) => {
  try {
    const item = await shopItemsModel.findOne({ itemName });
    if (!item) {
      return false;
    }
    if (item.stock < quantity) {
      return false;
    }
    item.stock -= quantity;
    await item.save();

    return true;
  } catch (error) {
    errorHandler(bot, error, "Removing Stock");
    return false;
  }
};
