import { WebhookClient } from "discord.js";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { logHandler } from "./logHandler";
import { config } from "dotenv";
config();

export const validateEnv = (bot:ExtendedClient) =>{
    if(!process.env.TOKEN || !process.env.DEBUGHOOK || !process.env.CONTRACT || !process.env.CLIENTID){
        logHandler.log("error", "Missing ENV");
        process.exit(1);
    }
    bot.config = {
        token:process.env.TOKEN,
        // dbUri:process.env.MONGO_URI,
        debugHook:new WebhookClient({
            url:process.env.DEBUGHOOK
        }) ,
        // balanceHook: new WebhookClient({
        //     url:process.env.TOKENHOOK
        // })
    }
}