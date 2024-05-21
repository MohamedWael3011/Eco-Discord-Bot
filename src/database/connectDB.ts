import { connect } from "mongoose"
import { config } from "dotenv"
import { errorHandler } from "../logger/errorHandler"
import { ExtendedClient } from "../interfaces/ExtendedClient"
config()
export const connectDB = async (bot: ExtendedClient) =>{
    
    connect(process.env.MONGO_URI || "no uri found").then(()=>{
        console.log("Connected to the Database Successfully")
    }).catch((err)=>errorHandler(bot,err,'DB Connection'));
}