import { validationOutput } from "./types";
import { search } from "./apiTests/search";
import { onSearch } from "./apiTests/on_search";
import { init } from "./apiTests/init";
import { onInit } from "./apiTests/on_init";
import { confirm } from "./apiTests/confirm";
import { onConfirm } from "./apiTests/onConfirm";
import { cancel } from "./apiTests/cancel";

export async function performL1CustomValidations(
  payload: any,
  action: string,
  subUrl: string,
  allErrors = false,
  externalData = {}
): Promise<validationOutput> {
  console.log("Performing custom L1 validations for action: " + action);

  switch (action) {
    case "search":
      return await search(payload, subUrl);
    case "on_search":
      return await onSearch(payload, subUrl);
    case "init":
      return await init(payload, subUrl);
    case "on_init":
      return await onInit(payload, subUrl);
    case "confirm":
      return await confirm(payload, subUrl);
    case "on_confirm":
      return await onConfirm(payload, subUrl);
    case "cancel":
      return await cancel(payload, subUrl);
    default: // Fixed default case
      return [
        {
          valid: true,
          code: 200,
          description: "Custom validation passed", // description is optional
        },
      ];
  }
}
