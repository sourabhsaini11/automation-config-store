import { validationOutput } from "./types";

export async function performL1CustomValidations(
	payload: any,
	action: string,
	subscriberUrl: string,
	allErrors = false,
	externalData = {}
): Promise<validationOutput> {
	console.log("Performing custom L1 validations for action: " + action);
	return [
		{
			valid: true,
			code: 200,
			description: "Custom validation passed",
		},
	];
}
