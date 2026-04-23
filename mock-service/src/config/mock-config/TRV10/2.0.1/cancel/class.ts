import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { cancelMultipleStopsSoftGenerator } from "./generator-soft-cancel";

export class MockMultipleStopSoftCancelClass extends MockAction {
  get saveData(): saveType {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8"),
    ) as saveType;
  }
  get defaultData(): any {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "./default.yaml"), "utf8"),
    );
  }
  get inputs(): any {
    return {};
  }
  name(): string {
    return "cancel";
  }
  get description(): string {
    return "Mock for cancel";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return cancelMultipleStopsSoftGenerator(existingPayload, sessionData);
  }
  async validate(targetPayload: any): Promise<MockOutput> {
    if (targetPayload.message.descriptor.code !== "SOFT_CANCEL") {
      return {
        valid: false,
        message: `Cancel status descriptor code sould be SOFT_CANCEL but got ${targetPayload.message.descriptor.code}.`,
      };
    }
    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    if (!sessionData.order_id) {
      return { valid: false, message: "No order_id available in session data" };
    }
    return { valid: true };
  }
}
