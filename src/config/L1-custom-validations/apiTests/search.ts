import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";

export async function search(payload: any,subUrl: string): Promise<validationOutput> {
  // Extract payload, context, domain and action

  const context = payload.context;
  const domain = context.domain;
  const action = context.action;
  const transaction_id = context.transaction_id;
  const payloadDetails = payload.message.intent["@ondc/org/payload_details"];
  const dimensions = payloadDetails?.dimensions;
  
  const weight = payloadDetails?.weight;
  console.log(`Running validations for ${domain}/${action}`);

  // Initialize results array
  const results: validationOutput = [];
  await RedisService.setKey(
    `${subUrl}:${transaction_id}:orderDimensions`,
    JSON.stringify({ dimensions })
  );

  await RedisService.setKey(
    `${subUrl}:${transaction_id}:orderWeight`,
    JSON.stringify({ weight })
  );

  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
