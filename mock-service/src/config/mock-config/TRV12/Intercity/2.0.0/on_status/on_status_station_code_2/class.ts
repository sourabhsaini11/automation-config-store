import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../../classes/mock-action";
import { SessionData } from "../../../../session-types";
import { onStatusGenerator } from "./generator";

export class MockOnStatusStationCode2Class extends MockAction {
  get saveData(): saveType {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "../save-data.yaml"), "utf8")
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
    return "";
  }
  get description(): string {
    return "";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return onStatusGenerator(existingPayload, sessionData);
  }
  async validate(targetPayload: any): Promise<MockOutput> {
    const order = targetPayload?.message?.order;
    if (order?.status !== "COMPLETED") {
      return {
        valid: false,
        message: `Invalid order state. Expected "COMPLETED", got ${order?.status}`,
      };
    }
    const invalidIndex = order?.fulfillments?.findIndex((fulfillment: any) => {
      if (fulfillment?.type !== "TRIP") return false;

      const startStop = fulfillment?.stops?.find(
        (stop: any) => stop?.type === "PICKUP",
      );

      return startStop?.authorization?.status !== "CLAIMED";
    });

    if (invalidIndex !== -1) {
      const fulfillment = order.fulfillments[invalidIndex];

      const startStop = fulfillment?.stops?.find(
        (stop: any) => stop?.type === "PICKUP",
      );

      return {
        valid: false,
        message: `Invalid authorization status at fulfillment index ${invalidIndex}. Expected "CLAIMED", got ${startStop?.authorization?.status}`,
      };
    }
    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    return { valid: true };
  }
}
