import constants from "./../utils/constants";
import { contextChecker } from "./../utils/contextUtils";

interface ValidationError {
  valid: boolean;
  code: number;
  description: string;
}

const addError = (
  result: ValidationError[],
  code: number,
  description: string
) => {
  result.push({ valid: false, code, description });
};

export async function catalogRejectionValidator(data: any) {
  const { context, errors } = data;
  const result: ValidationError[] = [];

  // Step 1: Validate context
  try {
    await contextChecker(
      context,
      result,
      constants.CATALOG_REJECTION,
      constants.CATALOG_REJECTION
    );
  } catch (err: any) {
    result.push({
      valid: false,
      code: 91000,
      description: `Context error: ${err.message}`,
    });
    return result;
  }

  // Step 2: Validate errors array
  if (!errors || !Array.isArray(errors)) {
    addError(result, 91001, "errors must be a non-empty array");
    return result;
  }

  errors.forEach((errObj: any, index: number) => {
    if (!errObj.type) {
      addError(result, 91002, `Missing 'type' in errors[${index}]`);
    }

    if (!errObj.code) {
      addError(result, 91003, `Missing 'code' in errors[${index}]`);
    }

    if (!errObj.path) {
      addError(result, 91004, `Missing 'path' in errors[${index}]`);
    }

    if (!errObj.message) {
      addError(result, 91005, `Missing 'message' in errors[${index}]`);
    }
  });

  return result;
}
