import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { initGenerator } from "./generator";
import { SessionData } from "../../../session-types";

export class MockInitWithoutSelectMetro201Class extends MockAction {
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
    return "init_METRO_201";
  }
  get description(): string {
    return "Mock for init_METRO_201";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return initGenerator(existingPayload, sessionData);
  }
  async validate(
    targetPayload: any,
    sessionData: SessionData
  ): Promise<MockOutput> {
    const items = targetPayload?.message?.order?.items || [];
    const fulfillments = targetPayload?.message?.order?.fulfillments || [];

    // Extract all fulfillment ids from payload


    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    // Check for collected_by
    if (!sessionData.collected_by) {
      return {
        valid: false,
        message: "No collected_by available in session data",
        code: "MISSING_COLLECTED_BY",
      };
    }

    // Check for buyer_app_fee
    if (
      sessionData.buyer_app_fee === undefined ||
      sessionData.buyer_app_fee === null
    ) {
      return {
        valid: false,
        message: "No buyer_app_fee available in session data",
        code: "MISSING_BUYER_APP_FEE",
      };
    }


    return { valid: true };
  }
}
