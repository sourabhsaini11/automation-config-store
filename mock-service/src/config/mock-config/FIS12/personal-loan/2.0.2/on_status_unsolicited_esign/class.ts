import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onStatusUnsolicitedEsignGenerator } from "./generator";

export class MockOnStatusUnsolicitedEsignPL3Class extends MockAction {
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
    name(): string { return "on_status_unsolicited_esign_pl_3"; }
    get description(): string { return "Mock for on_status_unsolicited after e-sign DYNAMIC_FORM - maps submission_id to xinput form_response"; }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> { return onStatusUnsolicitedEsignGenerator(existingPayload, sessionData); }
    async validate(targetPayload: any): Promise<MockOutput> { return { valid: true }; }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> { return { valid: true }; }
}
