import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onConfirmDefaultGenerator } from "./generator";

export class MockOnConfirmAirline200 extends MockAction {
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
    return "on_confirm_default";
  }
  get description(): string {
    return "Mock for on_confirm_default";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    console.log(
      "onConfirmDefaultClass generator called with existingPayload:",
      sessionData,
    );

    return onConfirmDefaultGenerator(existingPayload, sessionData, false);
  }
  async validate(targetPayload: any): Promise<MockOutput> {
    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    return { valid: true };
  }
}

export class MockOnStatusUnsoliciatedAirline200 extends MockAction {
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
    return "on_status_unsoliciated_Airline_200";
  }
  get description(): string {
    return "Mock for on_status_unsoliciated_Airline_200";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    console.log(
      "onConfirmDefaultClass generator called with existingPayload:",
      sessionData,
    );

    return onConfirmDefaultGenerator(existingPayload, sessionData, true);
  }
  async validate(targetPayload: any): Promise<MockOutput> {
    const order = targetPayload?.message?.order;
    if (order?.status !== "COMPLETED") {
      return {
        valid: false,
        message: `Invalid order state. Expected "COMPLETED", got ${order?.status}`,
      };
    }
    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    return { valid: true };
  }
}
