import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";

export async function confirm(
  payload: any,
  subUrl: string
): Promise<validationOutput> {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;
  const items = payload?.message?.order?.items;
  const quote = payload?.message?.order?.quote;
  const fulfillments = payload?.message?.order?.fulfillments;
  console.log(`Running validations for ${domain}/${action}`);

  await RedisService.setKey(
    `${subUrl}:${transaction_id}:confirmQuote`,
    JSON.stringify({ quote })
  );

  await RedisService.setKey(
    `${subUrl}:${transaction_id}:confirmItems`,
    JSON.stringify({ items })
  );

  await RedisService.setKey(
    `${subUrl}:${transaction_id}:confirmFulfillments`,
    JSON.stringify({ fulfillments })
  );

  const results: validationOutput = [];

  const validQuote = await validateQuote(payload, subUrl);
  console.log("Quote validation result:", validQuote);

  const validItems = await validateItems(payload, subUrl);
  console.log("Items validation result:", validItems);

  const validFulfillments = await validateFulfillments(payload, subUrl);
  console.log("Fulfillments validation result:", validFulfillments);

  // const validOrderDimensions = await validateOrderDimensions(payload);
  // console.log("Order Dimensions validation result:", validOrderDimensions);

  const acceptLSPterms = await validateLSPterms(payload, subUrl);
  console.log("LSP terms acceptance validation result:", acceptLSPterms);

  // const validTAT = await validateTAT(payload);
  // console.log("TAT validation result:", validTAT);

  if (!validQuote) {
    results.push({
      valid: false,
      code: 66002,
      description: `LSP is unable to validate the order request : Quote price does not match with /on_init`,
    });
  }

  if (!validItems) {
    results.push({
      valid: false,
      code: 66002,
      description: `LSP is unable to validate the order request : Items array does not match with /on_init`,
    });
  }

  if (!validFulfillments) {
    results.push({
      valid: false,
      code: 66002,
      description: `LSP is unable to validate the order request : Fulfillments array does not match with /on_init`,
    });
  }

  // if (!validOrderDimensions) {
  //   results.push({
  //     valid: false,
  //     code: 60011,
  //     description: `LSP is unable to validate the order request : Order dimensions/weight does not match with /search`,
  //   });
  // }

  if (!acceptLSPterms) {
    results.push({
      valid: false,
      code: 62501,
      description: `LSP is unable to validate the order request : LSP terms are not accepted by LBNP`,
    });
  }

  // if (!validTAT) {
  //   results.push({
  //     valid: false,
  //     code: 60008,
  //     description: `LSP is unable to validate the order request : S2D TAT or avg pickup time are different from what was quoted earlier in /on_search`,
  //   });
  // }

  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}

async function validateQuote(
  payload: Record<string, any>,
  subUrl: string
): Promise<boolean> {
  console.log("Running validateQuote");
  const transaction_id = payload?.context?.transaction_id;
  const quotePrice = payload?.message?.order?.quote?.price?.value;

  console.log("Transaction ID:", transaction_id);
  console.log("Incoming Quote Price:", quotePrice);

  if (!transaction_id || quotePrice == null) return false;

  const onInitQuoteRaw = await RedisService.getKey(
    `${subUrl}:${transaction_id}:onInitQuote`
  );
  console.log("Redis Quote Raw:", onInitQuoteRaw);
  if (!onInitQuoteRaw) return false;

  try {
    const onInitQuote = JSON.parse(onInitQuoteRaw);
    const storedPrice = onInitQuote?.quote?.price?.value;
    console.log("Stored Quote Price from Redis:", storedPrice);

    const isEqual = parseFloat(quotePrice) === parseFloat(storedPrice);
    console.log(
      `Parsed comparison: ${parseFloat(quotePrice)} === ${parseFloat(
        storedPrice
      )} =>`,
      isEqual
    );
    return isEqual;
  } catch (error) {
    console.error("Error parsing onInitQuote from Redis:", error);
    return false;
  }
}

async function validateItems(
  payload: Record<string, any>,
  subUrl: string
): Promise<boolean> {
  console.log("Running validateItems");
  const items = payload?.message?.order?.items;
  const transaction_id = payload?.context?.transaction_id;

  if (!Array.isArray(items) || !transaction_id) return false;

  const onInitItemsRaw = await RedisService.getKey(
    `${subUrl}:${transaction_id}:onInitItems`
  );
  console.log("Redis Items Raw:", onInitItemsRaw);
  if (!onInitItemsRaw) return false;

  try {
    const parsed = JSON.parse(onInitItemsRaw);
    const onInitItems = parsed?.items;
    if (!Array.isArray(onInitItems)) return false;

    return items.every((item) =>
      onInitItems.some((onInitItem) => item.id === onInitItem.id)
    );
  } catch (error) {
    console.error("Error parsing onInitItems from Redis:", error);
    return false;
  }
}

async function validateFulfillments(
  payload: Record<string, any>,
  subUrl: string
): Promise<boolean> {
  console.log("Running validateFulfillments");
  const fulfillments = payload?.message?.order?.fulfillments;
  const transaction_id = payload?.context?.transaction_id;

  if (!Array.isArray(fulfillments) || !transaction_id) return false;

  const onInitFulfillmentsRaw = await RedisService.getKey(
    `${subUrl}:${transaction_id}:onInitFulfillments`
  );
  console.log("Redis Fulfillments Raw:", onInitFulfillmentsRaw);
  if (!onInitFulfillmentsRaw) return false;

  try {
    const parsed = JSON.parse(onInitFulfillmentsRaw);
    const onInitFulfillments = parsed?.fulfillments;
    if (!Array.isArray(onInitFulfillments)) return false;

    return fulfillments.every((fulfillment) =>
      onInitFulfillments.some(
        (onInitFulfillment) =>
          fulfillment.id === onInitFulfillment.id &&
          fulfillment.type === onInitFulfillment.type
      )
    );
  } catch (error) {
    console.error("Error parsing onInitFulfillments from Redis:", error);
    return false;
  }
}

// async function validateOrderDimensions(payload: Record<string, any>): Promise<boolean> {
//   console.log("Running validateOrderDimensions");
//   const payloadDetails = payload.message.order["@ondc/org/payload_details"];
//   const dimensions = payloadDetails?.dimensions;
//   const weight = payloadDetails?.weight;
//   const transaction_id = payload?.context?.transaction_id;

//   if (!dimensions || !weight || !transaction_id) return false;

//   let searchDimensions = await RedisService.getKey(`${subUrl}:${transaction_id}:orderDimensions`);
//   let searchWeight = await RedisService.getKey(`${subUrl}:${transaction_id}:orderWeight`);
//   console.log("Redis Dimensions:", searchDimensions);
//   console.log("Redis Weight:", searchWeight);
//   if (!searchDimensions || !searchWeight) return false;

//   try {
//     searchDimensions = JSON.parse(searchDimensions).dimensions;
//     searchWeight = JSON.parse(searchWeight).weight;
//   } catch (error) {
//     console.error("Error parsing order details from Redis:", error);
//     return false;
//   }

//   function compareDimensions(obj1: any, obj2: any): boolean {
//     return (
//       obj1?.length?.unit === obj2?.length?.unit &&
//       obj1?.length?.value === obj2?.length?.value &&
//       obj1?.breadth?.unit === obj2?.breadth?.unit &&
//       obj1?.breadth?.value === obj2?.breadth?.value &&
//       obj1?.height?.unit === obj2?.height?.unit &&
//       obj1?.height?.value === obj2?.height?.value
//     );
//   }

//   function compareWeight(obj1: any, obj2: any): boolean {
//     return obj1?.unit === obj2?.unit && obj1?.value === obj2?.value;
//   }

//   return compareDimensions(dimensions, searchDimensions) && compareWeight(weight, searchWeight);
// }

async function validateLSPterms(
  payload: Record<string, any>,
  subUrl: string
): Promise<boolean> {
  console.log("Running validateLSPterms");
  const tags = payload?.message?.order?.tags;
  if (!Array.isArray(tags)) return false;

  return tags.some(
    (tag) =>
      tag.code === "bap_terms" &&
      Array.isArray(tag.list) &&
      tag.list.some(
        (item: { code: string; value: string }) =>
          item.code === "accept_bpp_terms" && item.value === "yes"
      )
  );
}

// async function validateTAT(payload: Record<string, any>): Promise<boolean> {
//   console.log("Running validateTAT");
//   const items = payload?.message?.order?.items;
//   const fulfillments = payload?.message?.order?.fulfillments;
//   const provider = payload?.message?.order?.provider?.id;
//   const transaction_id = payload?.context?.transaction_id;

//   if (!Array.isArray(items) || !Array.isArray(fulfillments) || !transaction_id)
//     return false;

//   let onSearchItemsRaw = await RedisService.getKey(
//     `${subUrl}:${transaction_id}:${provider}:onSearchItems`
//   );
//   let onSearchFulfillmentsRaw = await RedisService.getKey(
//     `${subUrl}:${transaction_id}:${provider}:onSearchFulfillments`
//   );

//   console.log("Redis onSearchItems:", onSearchItemsRaw);
//   console.log("Redis onSearchFulfillments:", onSearchFulfillmentsRaw);

//   if (!onSearchItemsRaw || !onSearchFulfillmentsRaw) return false;

//   try {
//     const onSearchItems = JSON.parse(onSearchItemsRaw).items;
//     const onSearchFulfillments = JSON.parse(
//       onSearchFulfillmentsRaw
//     ).fulfillments;

//     return (
//       items.every((item, idx) => {
//         const corresponding = onSearchItems[idx];
//         return (
//           item["@ondc/org/time_to_ship"] ===
//           corresponding["@ondc/org/time_to_ship"]
//         );
//       }) &&
//       fulfillments.every((fulfillment, idx) => {
//         const corresponding = onSearchFulfillments[idx];
//         return fulfillment["@ondc/org/TAT"] === corresponding["@ondc/org/TAT"];
//       })
//     );
//   } catch (error) {
//     console.error("Error validating TAT:", error);
//     return false;
//   }
// }
