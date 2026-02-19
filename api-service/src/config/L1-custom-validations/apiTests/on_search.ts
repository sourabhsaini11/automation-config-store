import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";

export async function onSearch(payload: any, subUrl: string): Promise<validationOutput> {
  // Extract payload, context, domain and action
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;
  const providers = payload?.message?.catalog["bpp/providers"];

  console.log(`Running validations for ${domain}/${action}`);

  // Initialize results array
  const results: validationOutput = [];

  for (const provider of providers) {
    const items = provider?.items;
    const fulfillments = provider?.fulfillments;
  
    await RedisService.setKey(
      `${subUrl}:${transaction_id}:onSearchItems`,
      JSON.stringify({ items })
    );
  
    await RedisService.setKey(
      `${subUrl}:${transaction_id}:onSearchFulfillments`,
      JSON.stringify({ fulfillments })
    );
  }
  // If no issues found, return a success result
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
