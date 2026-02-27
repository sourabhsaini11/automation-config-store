import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { selectForPartialCancellationGenerator } from "./generator";

export class MockSelectForPartialCancellationClass extends MockAction {
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
        return "select_for_partial_cancellation";
    }
    get description(): string {
        return "Mock for select_for_partial_cancellation - ensures first item has quantity > 1 for partial cancellation";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return selectForPartialCancellationGenerator(existingPayload, sessionData);
    }
    async validate(targetPayload: any, sessionData: SessionData): Promise<MockOutput> {
        const order = targetPayload?.message?.order;
        if (!order) return { valid: false, message: "Order not found in message", code: "MISSING_ORDER" };

        const provider = order.provider;
        if (!provider) return { valid: false, message: "Provider not found in order", code: "MISSING_PROVIDER" };

        if (sessionData.provider_id && provider.id !== sessionData.provider_id)
            return { valid: false, message: `Provider ID mismatch with session: ${sessionData.provider_id}`, code: "ID_MISMATCH" };

        const fulfillments = order.fulfillments;
        if (sessionData.fulfillments && fulfillments) {
            const validFulfillmentIds = new Set(sessionData.fulfillments.map((f: any) => f.id));
            const invalidFulfillmentIds = fulfillments.filter((f: any) => !validFulfillmentIds.has(f.id)).map((f: any) => f.id);
            if (invalidFulfillmentIds.length) {
                return { valid: false, message: `Fulfillment IDs [${invalidFulfillmentIds.join(", ")}] not found in previous search results`, code: "FULFILLMENT_ID_MISMATCH" };
            }
        }

        if (order.items) {
            const selectedItems = order.items;
            const itemsOnsearch = sessionData.items;

            if (itemsOnsearch) {
                const validItemIds = new Set(itemsOnsearch.map((i: any) => i.id));
                const invalidItemIds = selectedItems.filter((i: any) => !validItemIds.has(i.id)).map((i: any) => i.id);
                if (invalidItemIds.length) {
                    return { valid: false, message: `Item IDs [${invalidItemIds.join(", ")}] not found in previous search results`, code: "ITEM_ID_MISMATCH" };
                }
            }
        }

        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        // Validate user_inputs structure exists
        if (!sessionData.user_inputs) {
            return {
                valid: false,
                message: "user_inputs not found in session data",
                code: "MISSING_USER_INPUTS"
            };
        }

        const userInputs: any = sessionData.user_inputs;

        // Validate provider
        if (!userInputs.provider) {
            return {
                valid: false,
                message: "provider is required in user_inputs",
                code: "MISSING_PROVIDER"
            };
        }

        // Validate fulfillment
        if (!userInputs.fulfillments) {
            return {
                valid: false,
                message: "fulfillments is required in user_inputs",
                code: "MISSING_FULFILLMENT"
            };
        }

        // Validate items array
        if (!userInputs.items || !Array.isArray(userInputs.items) || userInputs.items.length === 0) {
            return {
                valid: false,
                message: "items array is required and must not be empty in user_inputs",
                code: "MISSING_OR_EMPTY_ITEMS"
            };
        }

        // Validate each item has required fields
        for (let i = 0; i < userInputs.items.length; i++) {
            const item = userInputs.items[i];
            if (!item.itemId) {
                return {
                    valid: false,
                    message: `itemId is required for item at index ${i}`,
                    code: "MISSING_ITEM_ID"
                };
            }
        }

        // IMPORTANT: Validate first item has quantity > 1 for partial cancellation
        const firstItem = userInputs.items[0];
        if (!firstItem.count || typeof firstItem.count !== 'number' || firstItem.count <= 1) {
            return {
                valid: false,
                message: "First item must have quantity > 1 for partial cancellation flow (found: " + (firstItem.count || 0) + ")",
                code: "INSUFFICIENT_QUANTITY_FOR_PARTIAL_CANCELLATION"
            };
        }

        return { valid: true };
    }
}