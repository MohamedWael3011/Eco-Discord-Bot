import sdk from "@api/opensea";
import { config } from "dotenv";
import { errorHandler } from "../../logger/errorHandler";
config();
async function getListings(tokenId: number, bot) {
  try {
    sdk.auth(process.env.OPENSEA);
    sdk.server("https://api.opensea.io");
    const lisitngs = await sdk.get_listings({
      asset_contract_address: process.env.CONTRACT,
      token_ids: tokenId,
      chain: "matic",
      protocol: "seaport",
    });

    return lisitngs.data;
  } catch (err) {
    errorHandler(bot, err, "Fetching Listings");
  }
}

export default async function isListed(tokenId: number, bot) {
  const listings = await getListings(tokenId, bot);
  let flag = false;
  const currentTimestamp = Date.now();
  listings.orders.forEach((order) => {
    if (order.expiration_time >= currentTimestamp) {
      flag = true;
    }
  });

  return flag;
}
