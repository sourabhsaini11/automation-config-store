import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { onConfirmDelayGenerator } from "./on_confirm_driver_assigned/delay-generator"

export class MockDelayOnConfirmClass extends MockAction {
  get saveData(): saveType {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8"),
    ) as saveType;
  }
  get defaultData(): any {
    return yaml.load(
      readFileSync(
        path.resolve(__dirname, "./on_confirm_driver_assigned/default.yaml"),
        "utf8",
      ),
    );
  }
  get inputs(): any {
    return {};
  }
  name(): string {
    return "on_confirm_ride_delay";
  }
  get description(): string {
    return "Mock for on_confirm_ride_delay";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return onConfirmDelayGenerator(existingPayload, sessionData);
  }
  async validate(targetPayload: any): Promise<MockOutput> {
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
