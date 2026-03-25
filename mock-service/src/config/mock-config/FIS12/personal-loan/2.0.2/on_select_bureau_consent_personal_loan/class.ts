import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onSelectDefaultGenerator } from "./generator";

export class MockOnSelectBureauConsentPersonalLoanClass extends MockAction {
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
        return "on_select_bureau_consent_personal_loan";
    }
    get description(): string {
        return "Mock for on_select bureau consent personal loan";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return onSelectDefaultGenerator(existingPayload, sessionData);
    }
    async validate(targetPayload: any): Promise<MockOutput> {
        // Basic structural validation for the two variants
        const order = targetPayload?.message?.order;
        if (!order) return { valid: true };
        const items = Array.isArray(order.items) ? order.items : [];
        const firstItem = items[0];
        const locIds = Array.isArray(firstItem?.location_ids) ? firstItem.location_ids : [];
        // If fulfillments exist, we expect single location and agent
        if (Array.isArray(order.fulfillments) && order.fulfillments.length > 0) {
            if (locIds.length !== 1) {
                return { valid: false, message: "on_select second-step must have a single location_id" };
            }
            const agent = order.fulfillments[0]?.agent;
            if (!agent?.person?.name || !agent?.contact?.phone) {
                return { valid: false, message: "on_select fulfillments must include agent person.name and contact.phone" };
            }
        }
        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        // flow id comes from config: Gold_Loan_With_Account_Aggregator / Gold_Loan_Without_Account_Aggregator
        const flowId = sessionData.usecaseId || sessionData.flow_variant;
        const stage = (sessionData as any).stage;
        const status = (sessionData as any).last_select_status;
        const selectedLoc = (sessionData as any).selected_location_id;

        if (!sessionData.transaction_id) {
            return { valid: false, message: "No transaction_id available in session data" };
        }

        if (flowId === "Gold_Loan_Without_Account_Aggregator" || (sessionData as any).flow_variant === "WITHOUT_AA") {
            // First-step allowed when stage not set or waiting and not SUCCESS
            if (!stage || stage === "need_fo2" || (stage === "fo2_awaiting_success" && status !== "SUCCESS")) {
                return { valid: true };
            }
            // Second-step requires SUCCESS and a selected location
            if (stage === "fo2_awaiting_success" && status === "SUCCESS") {
                if (!selectedLoc) {
                    return { valid: false, message: "selected_location_id missing for second on_select" };
                }
                return { valid: true };
            }
            // If stage is after second step, still allow
            if (stage === "fo3_done") {
                return { valid: true };
            }
            return { valid: false, message: "on_select not allowed in current WITHOUT_AA stage" };
        }

        // WITH_AA: let generator shape it; minimal gate
        return { valid: true };
    }
} 