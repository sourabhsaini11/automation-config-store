import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../../classes/mock-action";
import { onInitMonthlyPassGenerator } from "./generator";
import { SessionData } from "../../../../session-types";

export class MockOnInitMonthlyPassBus201Class extends MockAction {
  get saveData(): saveType {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8")
    ) as saveType;
  }
  get defaultData(): any {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "./default.yaml"), "utf8")
    );
  }
  get inputs(): any {
    return {};
  }
  name(): string {
    return "on_init_monthly_pass_BUS_201";
  }
  get description(): string {
    return "Mock for on_init_monthly_pass_BUS_201";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return onInitMonthlyPassGenerator(existingPayload, sessionData);
  }
   async validate(
  targetPayload: any,
  sessionData: SessionData
): Promise<MockOutput> {
  const items = targetPayload?.message?.order?.items || [];
  const fulfillments = targetPayload?.message?.order?.fulfillments || [];

  // Extract all fulfillment ids from payload
  const payloadFulfillmentIds = fulfillments.map((f: any) => f.id);

  for (const item of items) {
    // 1. check item id in sessionData.selected_item_ids
    if (!sessionData.selected_item_ids.includes(item.id)) {
      return {
        valid: false,
        message: `Item id ${item.id} not found in sessionData.selected_item_ids: ${sessionData.selected_item_ids}`,
      };
    }

    // 2. check item.fulfillment_ids are present in payload.fulfillments
    const itemFulfillmentIds = item.fulfillment_ids || [];
    if (
      !itemFulfillmentIds.every((fid: string) =>
        payloadFulfillmentIds.includes(fid)
      )
    ) {
      return {
        valid: false,
        message: `Item ${item.id} has invalid fulfillment ids. Expected subset of ${payloadFulfillmentIds}, got ${itemFulfillmentIds}`,
      };
    }

    // 3. check quantity within min and max for that item in sessionData.items
    const sessionItem = sessionData.items?.find((i: any) => i.id === item.id);
    const selectedCount = item?.quantity?.selected?.count;

    if (!sessionItem) {
      return {
        valid: false,
        message: `Item ${item.id} not found in sessionData.items`,
      };
    }

    const min = sessionItem?.quantity?.minimum?.count ?? 1;
    const max = sessionItem?.quantity?.maximum?.count ?? Infinity;

    if (selectedCount < min || selectedCount > max) {
      return {
        valid: false,
        message: `Item ${item.id} quantity out of range. Expected between ${min} and ${max}, got ${selectedCount}`,
      };
    }
  }

  // 4. check quote value & currency matches sessionData.quote
  const payloadQuote = targetPayload?.message?.order?.quote?.price;
  const sessionQuote = sessionData?.quote?.price;

  if (!payloadQuote || !sessionQuote) {
    return {
      valid: false,
      message: `Quote missing in payload or sessionData`,
    };
  }

  if (
    payloadQuote.value !== sessionQuote.value ||
    payloadQuote.currency !== sessionQuote.currency
  ) {
    return {
      valid: false,
      message: `Quote mismatch. Expected ${sessionQuote.currency} ${sessionQuote.value}, got ${payloadQuote.currency} ${payloadQuote.value}`,
    };
  }

  return { valid: true };
}
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
  // Check for payments
  if (!sessionData.payments || sessionData.payments.length === 0) {
    return {
      valid: false,
      message: "No payments available in session data",
      code: "MISSING_PAYMENTS",
    };
  }

  // Check for items
  if (!sessionData.items || sessionData.items.length === 0) {
    return {
      valid: false,
      message: "No items available in session data",
      code: "MISSING_ITEMS",
    };
  }

  // Check for fulfillments
  if (!sessionData.fulfillments || sessionData.fulfillments.length === 0) {
    return {
      valid: false,
      message: "No fulfillments available in session data",
      code: "MISSING_FULFILLMENTS",
    };
  }

  // Check for quote
  if (!sessionData.quote) {
    return {
      valid: false,
      message: "No quote available in session data",
      code: "MISSING_QUOTE",
    };
  }

  // All requirements satisfied
  return { valid: true };
}
}
