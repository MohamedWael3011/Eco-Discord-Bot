import { ApplicationCommandData, Client, Collection, WebhookClient } from "discord.js";
import { ICommand } from "./ICommand";

export interface ExtendedClient extends Client {
  cache: { [key: string]: { allow: string[]; deny: string[] } };
  commands: ICommand ;
  config: {
    token: string;
    // dbUri: string;
    debugHook: WebhookClient;
    // balanceHook: WebhookClient;
  }
}
