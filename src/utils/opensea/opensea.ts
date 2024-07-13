import sdk from "@api/opensea";
import { config } from "dotenv";
import { errorHandler } from "../../logger/errorHandler";
config();

const MAX_RETRIES = 3; // Maximum number of retries
const RETRY_DELAY = 2000; // Delay between retries in milliseconds

async function getListings(tokenId: number, bot, retries = MAX_RETRIES) {
  try {
    sdk.auth(process.env.OPENSEA);
    sdk.server("https://api.opensea.io");
    const listings = await sdk.get_listings({
      asset_contract_address: process.env.CONTRACT,
      token_ids: tokenId,
      chain: "matic",
      protocol: "seaport",
    });
    console.log(listings.data);
    return listings.data;
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // Wait for the delay
      return getListings(tokenId, bot, retries - 1); // Retry the function
    } else {
      errorHandler(bot, err, "Fetching Listings");
      throw err; // Rethrow the error after exhausting retries
    }
  }
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export default async function isListed(tokenId: number, bot) {
  try {
    const listings = await getListings(tokenId, bot);
    let flag = false;
    const currentTimestamp = getTimestampInSeconds();
    listings.orders.forEach((order) => {
      if (order.expiration_time >= currentTimestamp) {
        flag = true;
      }
    });
    return flag;
  } catch (err) {
    errorHandler(bot, err, "Checking if listing");
    return false;
  }
}
