import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../../classes/mock-action";
import { SessionData } from "../../../../session-types";
import { onSearchIncrementalPull3Generator } from "./generator";

export class MockOnSearchIncrementalPull3Class extends MockAction {
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
        return "on_search_incremental_pull_3";
    }
    get description(): string {
        return "Mock for on_search_incremental_pull_3";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return onSearchIncrementalPull3Generator(existingPayload, sessionData);
    }
    async validate(targetPayload: any, sessionData: SessionData): Promise<MockOutput> {
        const provider = targetPayload?.message?.catalog?.providers?.[0];
        if (!provider) return { valid: false, message: "Provider not found", code: "MISSING_PROVIDER" };
        const allowedCategoryCodes = [
            "CULTURE_HERITAGE",
            "MONUMENT_HISTORICAL_SITE",
            "MUSEUM",
            "MEMORIAL",
            "EXHIBITION",
            "OTHERS",
            "HANDICRAFT",
            "HANDLOOM"
        ];
        const providers = targetPayload?.message?.catalog?.providers;
        if (providers && Array.isArray(providers)) {
            for (const provider of providers) {
                if (provider.categories && Array.isArray(provider.categories)) {
                    for (const cat of provider.categories) {
                        const code = cat?.descriptor?.code;
                        if (code && !allowedCategoryCodes.includes(code)) {
                            return {
                                valid: false,
                                message: `Invalid category code: ${code}. Allowed codes are: ${allowedCategoryCodes.join(", ")}`,
                                code: "INVALID_CATEGORY_CODE"
                            };
                        }
                    }
                }
            }
        }
        if (sessionData.provider_id && provider.id !== sessionData.provider_id)
            return { valid: false, message: `Provider ID mismatch: ${sessionData.provider_id}`, code: "ID_MISMATCH" };

        if (sessionData.fulfillments_search_2 && provider.fulfillments) {
            const ids = (f: any[]) => f.map(x => x.id).sort().join();
            if (ids(sessionData.fulfillments_search_2) !== ids(provider.fulfillments))
                return { valid: false, message: "Fulfillment IDs changed", code: "FULFILLMENT_MISMATCH" };
        }

        const prevCats = sessionData.category_ids_search_2;
        if (prevCats?.length) {
            const currCats = new Set(provider.items?.flatMap((i: any) => i.category_ids || []));
            const missing = prevCats.filter(id => !currCats.has(id));
            if (missing.length) return { valid: false, message: `Missing categories: ${missing}`, code: "CATEGORY_MISMATCH" };
        }

        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        if (!sessionData.collected_by) {
            return {
                valid: false,
                message: "Payment collection method is required in session data",
                code: "MISSING_COLLECTED_BY"
            };
        }
        if (!sessionData.start_time || !sessionData.end_time) {
            return {
                valid: false,
                message: "Start time and end time are required in session data",
                code: "MISSING_TIME_RANGE"
            };
        }
        return { valid: true };
    }
}