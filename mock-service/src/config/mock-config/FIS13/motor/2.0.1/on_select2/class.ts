import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onSelectDefaultGenerator } from "./generator";

export class MockOnSelect2Class extends MockAction {
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
        return "on_select";
    }
    get description(): string {
        return "Mock for on_select";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return onSelectDefaultGenerator(existingPayload, sessionData);
    }
    async validate(targetPayload: any): Promise<MockOutput> {
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



        // WITH_AA: let generator shape it; minimal gate
        return { valid: true };
    }
} 