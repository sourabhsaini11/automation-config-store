import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onUpdateMissedEmiUnsolicitedDefaultGenerator } from "./generator";

export class MockOnUpdateMissedEmiUnsolicitedClass extends MockAction {
    get saveData(): saveType {
        // Action-specific save-data
        return yaml.load(
            readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8")
        ) as saveType;
    }
    get defaultData(): any {
        // Use the missed EMI unsolicited default payload
        return yaml.load(
            readFileSync(path.resolve(__dirname, "./default.yaml"), "utf8")
        );
    }
    get inputs(): any {
        return {};
    }
    name(): string {
        return "on_update_missed_emi_unsolicited";
    }
    get description(): string {
        return "Mock for unsolicited on_update after missed EMI payment (payment status update)";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return onUpdateMissedEmiUnsolicitedDefaultGenerator(existingPayload, sessionData);
    }
    async validate(_targetPayload: any): Promise<MockOutput> {
        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        if (!sessionData.transaction_id) {
            return {
                valid: false,
                message: "No transaction_id available in session data",
            };
        }
        return { valid: true };
    }
}


