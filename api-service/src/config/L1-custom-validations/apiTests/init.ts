import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";

export async function init(payload: any, subUrl: string): Promise<validationOutput> {
  const results: validationOutput = [];

  try {
    const context = payload?.context;
    const domain = context?.domain;
    const action = context?.action;
    console.log(`Running validations for ${domain}/${action}`);

    const isValidItems = await validateItems(payload, subUrl);

    if (!isValidItems) {
      results.push({
        valid: false,
        code: 66002,
        description: `LSP is unable to validate the order request : Selected item does not match in the catalog provided in /on_search`,
      });
    }

    if (results.length === 0) {
      results.push({ valid: true, code: 200 });
    }

    console.log("Validation Results:", results);
    return results;
  } catch (error) {
    console.error("Error during init validation:", error);
    results.push({
      valid: false,
      code: 500,
      description: "An unexpected error occurred during validation.",
    });
    return results;
  }
}

/**
 * Validates that the items object is valid
 *
 * @param payload The request payload
 * @returns boolean indicating if validation passed
 */
async function validateItems(payload: Record<string, any>, subUrl: string): Promise<boolean> {
  try {
    const items = payload?.message?.order?.items;
    const transaction_id = payload?.context?.transaction_id;

    if (!Array.isArray(items) || !transaction_id) {
      console.warn(
        "Invalid payload structure: items or transaction_id missing"
      );
      return false;
    }

    console.log("Inside validateItems: L1 custom vals");

    let onSearchItems: any = await RedisService.getKey(
      `${subUrl}:${transaction_id}:onSearchItems`
    );

    if (!onSearchItems) {
      console.warn(
        "No items found in Redis for transaction_id:",
        transaction_id
      );
      return false;
    }

    try {
      onSearchItems = JSON.parse(onSearchItems);
      onSearchItems = onSearchItems.items;
      console.log(items);
    } catch (error) {
      console.warn("Error parsing onSearchItems from Redis:", error);
      return false;
    }

    if (!Array.isArray(onSearchItems)) {
      console.error("Parsed onSearchItems is not an array");
      return false;
    }

    const validItems = items.every((item) => {
      console.log("Checking item:", item.id);

      const matchFound = onSearchItems.some((onSearchItem) => {
        console.log("Against onSearchItem:", onSearchItem.id);

        const idMatch = item.id === onSearchItem.id;
        // const fulfillmentIdMatch =
        //   item.fulfillment_id === onSearchItem.fulfillment_id;
        // const fulfillmentIdsMatch =
        //   JSON.stringify(item.fulfillment_ids || []) ===
        //   JSON.stringify(onSearchItem.fulfillment_ids || []);
        const categoryMatch = item.category_id === onSearchItem.category_id;

        if (!idMatch)
          console.log(`id mismatch: ${item.id} ≠ ${onSearchItem.id}`);
        // if (!fulfillmentIdMatch)
        //   console.log(
        //     `fulfillment_id mismatch: ${item.fulfillment_id} ≠ ${onSearchItem.fulfillment_id}`
        //   );
        // if (!fulfillmentIdsMatch)
        //   console.log(
        //     `fulfillment_ids mismatch: ${JSON.stringify(
        //       item.fulfillment_ids
        //     )} ≠ ${JSON.stringify(onSearchItem.fulfillment_ids)}`
        //   );
        if (!categoryMatch)
          console.log(
            `category_id mismatch: ${item.category_id} ≠ ${onSearchItem.category_id}`
          );

        return (
          idMatch  && categoryMatch
        );
      });

      if (!matchFound) {
        console.log(`No match found for item ${item.id}`);
      } else {
        console.log(`Match found for item ${item.id}`);
      }

      return matchFound;
    });
    console.log("Final item validation result:", validItems);
    return validItems;
  } catch (error) {
    console.error("Unexpected error in validateItems:", error);
    return false;
  }
}
