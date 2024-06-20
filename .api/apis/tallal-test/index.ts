import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'tallal-test/1.0.0 (api/6.1.1)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Use this API to explore a collection's metadata and statistics (sales, volume, etc).
   *
   * @summary Collections
   */
  getCollectionsV7(metadata: types.GetCollectionsV7MetadataParam): Promise<FetchResponse<200, types.GetCollectionsV7Response200>> {
    return this.core.fetch('/{chain}/collections/v7', 'get', metadata);
  }

  /**
   * Get a list of tokens with full metadata. This is useful for showing a single token page,
   * or scenarios that require more metadata.
   *
   * @summary Tokens
   */
  getTokensV6(metadata: types.GetTokensV6MetadataParam): Promise<FetchResponse<200, types.GetTokensV6Response200>> {
    return this.core.fetch('/{chain}/tokens/v6', 'get', metadata);
  }

  /**
   * Get top selling and minting collections
   *
   * @summary Top Selling Collections
   */
  getCollectionsTrendingV1(metadata: types.GetCollectionsTrendingV1MetadataParam): Promise<FetchResponse<200, types.GetCollectionsTrendingV1Response200>> {
    return this.core.fetch('/{chain}/collections/trending/v1', 'get', metadata);
  }

  /**
   * Get a list of asks (listings), filtered by token, collection or maker. This API is
   * designed for efficiently ingesting large volumes of orders, for external processing.
   *
   *  To get all orders unflitered, select `sortBy` to `updatedAt`. No need to pass any other
   * param. This will return any orders for any collections, token, attribute, etc.
   *
   *  Please mark `excludeEOA` as `true` to exclude Blur orders.
   *
   * @summary Asks (listings)
   */
  getOrdersAsksV5(metadata: types.GetOrdersAsksV5MetadataParam): Promise<FetchResponse<200, types.GetOrdersAsksV5Response200>> {
    return this.core.fetch('/{chain}/orders/asks/v5', 'get', metadata);
  }

  /**
   * Get a list of bids (offers), filtered by token, collection or maker. This API is
   * designed for efficiently ingesting large volumes of orders, for external processing.
   *
   *  There are a different kind of bids than can be returned:
   *
   * - To get all orders unfiltered, select `sortBy` to `updatedAt`. No need to pass any
   * other param. This will return any orders for any collections, token, attribute, etc. 
   *
   * - Inputting a 'contract' will return token and attribute bids.
   *
   * - Inputting a 'collection-id' will return collection wide bids.
   *
   * - Please mark `excludeEOA` as `true` to exclude Blur orders.
   *
   * @summary Bids (offers)
   */
  getOrdersBidsV6(metadata: types.GetOrdersBidsV6MetadataParam): Promise<FetchResponse<200, types.GetOrdersBidsV6Response200>> {
    return this.core.fetch('/{chain}/orders/bids/v6', 'get', metadata);
  }

  /**
   * This API can be used to build a feed for a user including sales, asks, transfers, mints,
   * bids, cancelled bids, and cancelled asks types.
   *
   * @summary Users activity
   */
  getUsersActivityV6(metadata: types.GetUsersActivityV6MetadataParam): Promise<FetchResponse<200, types.GetUsersActivityV6Response200>> {
    return this.core.fetch('/{chain}/users/activity/v6', 'get', metadata);
  }

  /**
   * This API can be used to build a feed for a token activity including sales, asks,
   * transfers, mints, bids, cancelled bids, and cancelled asks types.
   *
   * @summary Token activity
   */
  getTokensTokenActivityV5(metadata: types.GetTokensTokenActivityV5MetadataParam): Promise<FetchResponse<200, types.GetTokensTokenActivityV5Response200>> {
    return this.core.fetch('/{chain}/tokens/{token}/activity/v5', 'get', metadata);
  }

  /**
   * Get aggregate stats for a user, grouped by collection. Useful for showing total
   * portfolio information.
   *
   * @summary User collections
   */
  getUsersUserCollectionsV3(metadata: types.GetUsersUserCollectionsV3MetadataParam): Promise<FetchResponse<200, types.GetUsersUserCollectionsV3Response200>> {
    return this.core.fetch('/{chain}/users/{user}/collections/v3', 'get', metadata);
  }

  /**
   * Get tokens held by a user, along with ownership information such as associated orders
   * and date acquired.
   *
   * @summary User Tokens
   */
  getUsersUserTokensV7(metadata: types.GetUsersUserTokensV7MetadataParam): Promise<FetchResponse<200, types.GetUsersUserTokensV7Response200>> {
    return this.core.fetch('/{chain}/users/{user}/tokens/v7', 'get', metadata);
  }

  /**
   * Use this API to see all possible attributes within a collection.
   *
   * - `floorAskPrice` for all attributes might not be returned on collections with more than
   * 10k tokens. 
   *
   * - Attributes are case sensitive.
   *
   * @summary All attributes
   */
  getCollectionsCollectionAttributesAllV4(metadata: types.GetCollectionsCollectionAttributesAllV4MetadataParam): Promise<FetchResponse<200, types.GetCollectionsCollectionAttributesAllV4Response200>> {
    return this.core.fetch('/{chain}/collections/{collection}/attributes/all/v4', 'get', metadata);
  }

  /**
   * This API can be used to check the status of cross posted listings and bids.
   *
   *  Input your `crossPostingOrderId` into the `ids` param and submit for the status. 
   *
   *  The `crossPostingOrderId` is returned in the `execute/bids` and `execute/asks`
   * response.
   *
   * @summary Check cross posting status
   */
  getCrosspostingordersV1(metadata: types.GetCrosspostingordersV1MetadataParam): Promise<FetchResponse<200, types.GetCrosspostingordersV1Response200>> {
    return this.core.fetch('/{chain}/cross-posting-orders/v1', 'get', metadata);
  }

  /**
   * Submit signed orders
   *
   */
  postOrderV4(body: types.PostOrderV4BodyParam, metadata: types.PostOrderV4MetadataParam): Promise<FetchResponse<200, types.PostOrderV4Response200>>;
  postOrderV4(metadata: types.PostOrderV4MetadataParam): Promise<FetchResponse<200, types.PostOrderV4Response200>>;
  postOrderV4(body?: types.PostOrderV4BodyParam | types.PostOrderV4MetadataParam, metadata?: types.PostOrderV4MetadataParam): Promise<FetchResponse<200, types.PostOrderV4Response200>> {
    return this.core.fetch('/{chain}/order/v4', 'post', body, metadata);
  }

  /**
   * Generate bids and submit them to multiple marketplaces.
   *
   *  Notes:
   *
   * - Please use the `/cross-posting-orders/v1` to check the status on cross posted bids.
   *
   * @summary Create bids (offers)
   */
  postExecuteBidV5(body: types.PostExecuteBidV5BodyParam, metadata: types.PostExecuteBidV5MetadataParam): Promise<FetchResponse<200, types.PostExecuteBidV5Response200>> {
    return this.core.fetch('/{chain}/execute/bid/v5', 'post', body, metadata);
  }

  /**
   * Use this API to fill listings. We recommend using the SDK over this API as the SDK will
   * iterate through the steps and return callbacks. Please mark `excludeEOA` as `true` to
   * exclude Blur orders.
   *
   * @summary Buy tokens (fill listings)
   */
  postExecuteBuyV7(body: types.PostExecuteBuyV7BodyParam, metadata: types.PostExecuteBuyV7MetadataParam): Promise<FetchResponse<200, types.PostExecuteBuyV7Response200>> {
    return this.core.fetch('/{chain}/execute/buy/v7', 'post', body, metadata);
  }

  /**
   * Cancel existing orders on any marketplace
   *
   * @summary Cancel orders
   */
  postExecuteCancelV3(body: types.PostExecuteCancelV3BodyParam, metadata: types.PostExecuteCancelV3MetadataParam): Promise<FetchResponse<200, types.PostExecuteCancelV3Response200>>;
  postExecuteCancelV3(metadata: types.PostExecuteCancelV3MetadataParam): Promise<FetchResponse<200, types.PostExecuteCancelV3Response200>>;
  postExecuteCancelV3(body?: types.PostExecuteCancelV3BodyParam | types.PostExecuteCancelV3MetadataParam, metadata?: types.PostExecuteCancelV3MetadataParam): Promise<FetchResponse<200, types.PostExecuteCancelV3Response200>> {
    return this.core.fetch('/{chain}/execute/cancel/v3', 'post', body, metadata);
  }

  /**
   * Use this API to accept bids. We recommend using the SDK over this API as the SDK will
   * iterate through the steps and return callbacks. Please mark `excludeEOA` as `true` to
   * exclude Blur orders.
   *
   * @summary Sell tokens (accept bids)
   */
  postExecuteSellV7(body: types.PostExecuteSellV7BodyParam, metadata: types.PostExecuteSellV7MetadataParam): Promise<FetchResponse<200, types.PostExecuteSellV7Response200>> {
    return this.core.fetch('/{chain}/execute/sell/v7', 'post', body, metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetCollectionsCollectionAttributesAllV4MetadataParam, GetCollectionsCollectionAttributesAllV4Response200, GetCollectionsTrendingV1MetadataParam, GetCollectionsTrendingV1Response200, GetCollectionsV7MetadataParam, GetCollectionsV7Response200, GetCrosspostingordersV1MetadataParam, GetCrosspostingordersV1Response200, GetOrdersAsksV5MetadataParam, GetOrdersAsksV5Response200, GetOrdersBidsV6MetadataParam, GetOrdersBidsV6Response200, GetTokensTokenActivityV5MetadataParam, GetTokensTokenActivityV5Response200, GetTokensV6MetadataParam, GetTokensV6Response200, GetUsersActivityV6MetadataParam, GetUsersActivityV6Response200, GetUsersUserCollectionsV3MetadataParam, GetUsersUserCollectionsV3Response200, GetUsersUserTokensV7MetadataParam, GetUsersUserTokensV7Response200, PostExecuteBidV5BodyParam, PostExecuteBidV5MetadataParam, PostExecuteBidV5Response200, PostExecuteBuyV7BodyParam, PostExecuteBuyV7MetadataParam, PostExecuteBuyV7Response200, PostExecuteCancelV3BodyParam, PostExecuteCancelV3MetadataParam, PostExecuteCancelV3Response200, PostExecuteSellV7BodyParam, PostExecuteSellV7MetadataParam, PostExecuteSellV7Response200, PostOrderV4BodyParam, PostOrderV4MetadataParam, PostOrderV4Response200 } from './types';
