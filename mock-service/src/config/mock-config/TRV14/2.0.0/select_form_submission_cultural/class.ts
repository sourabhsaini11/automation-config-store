import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { selectPurchaseCultureGenerator } from "./generator";

export class MockSelectPurchaseCultureClass extends MockAction {
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
        return "select_2";
    }
    get description(): string {
        return "Mock for select_2";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return selectPurchaseCultureGenerator(existingPayload, sessionData);
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

        const items = order.items;
        if (items) {
            if (sessionData.items) {
                const validItemIds = new Set(sessionData.items.map((i: any) => i.id));
                const invalidIds = items.filter((i: any) => !validItemIds.has(i.id)).map((i: any) => i.id);
                if (invalidIds.length) {
                    return { valid: false, message: `Item IDs [${invalidIds.join(", ")}] not found in previous search results`, code: "ITEM_ID_MISMATCH" };
                }
            }
        }

        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        if (!sessionData.selected_items || !Array.isArray(sessionData.selected_items) || sessionData.selected_items.length === 0) {
            return {
                valid: false,
                message: "Selected items are required in session data",
                code: "MISSING_SELECTED_ITEMS"
            };
        }

        if (!sessionData.selected_provider) {
            return {
                valid: false,
                message: "Selected provider is required in session data",
                code: "MISSING_SELECTED_PROVIDER"
            };
        }

        if (!sessionData.selected_fulfillments || !Array.isArray(sessionData.selected_fulfillments) || sessionData.selected_fulfillments.length === 0) {
            return {
                valid: false,
                message: "Selected fulfillments are required in session data",
                code: "MISSING_SELECTED_FULFILLMENTS"
            };
        }

        return { valid: true };
    }
} 