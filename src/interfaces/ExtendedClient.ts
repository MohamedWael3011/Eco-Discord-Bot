import { ApplicationCommandData, Client, Collection, WebhookClient } from "discord.js";
import { ICommand } from "./ICommand";

export interface ExtendedClient extends Client {
  cache: { [key: string]: string | number };
  commands: ICommand ;
  config: {
    token: string;
    // dbUri: string;
    debugHook: WebhookClient;
    // balanceHook: WebhookClient;
  }
}
