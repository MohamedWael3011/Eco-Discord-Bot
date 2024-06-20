import sdk from "@api/tallal-test";
import { errorHandler } from "../../logger/errorHandler";

export async function getActiveListing() {
  let activeList;
  sdk.auth("Bearer YOUR_API_KEY");
  sdk.server("https://api-mainnet.magiceden.dev/v3/rtp");
  sdk
    .getOrdersAsksV5({
      contracts: ["0x2595484e4409ca51c533fcb0c87ed2efcd3ab5fb"],
      status: "active",
      includeCriteriaMetadata: false,
      includeRawData: false,
      includeDynamicPricing: false,
      excludeEOA: false,
      normalizeRoyalties: false,
      sortBy: "createdAt",
      limit: 100,
      chain: "polygon",
      accept: "*/*",
    })
    .then(({ data }) => (activeList = data))
    .catch((err) => {
      console.error(err);
    });

  return activeList;
}
