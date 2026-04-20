import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import {
  MockAction,
  MockOutput,
  saveType,
} from "../../../../../classes/mock-action";
import { SessionData } from "../../../../../session-types";
import { issueStatusGenerator_100 } from "../generator";

export class MockIssueOpenBus_100_Class extends MockAction {
  get saveData(): saveType {
    return yaml.load(
      readFileSync(path.resolve(__dirname, "../../save-data.yaml"), "utf8")
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
    return "issue_open";
  }
  get description(): string {
    return "Mock for issue_open";
  }
  generator(existingPayload: any, sessionData: SessionData): Promise<any> {
    return issueStatusGenerator_100(
      existingPayload,
      {
        ...sessionData,
        igm_action: "issue_open",
      },
      sessionData.user_inputs
    );
  }
  async validate(
    targetPayload: any,
    sessionData: SessionData
  ): Promise<MockOutput> {
    return { valid: true };
  }
  async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
    // Validate required session data for confirm generator
    return { valid: true };
  }
}
