/**
 * Shared Settlement Amount Utility — Personal Loan 2.0.2
 *
 * Calculates the BAP finder fee (SETTLEMENT_AMOUNT) from session data
 * and injects it into all payment tags in the payload.
 */

/**
 * Converts a loan term string to months.
 * Handles:
 *   - ISO 8601: "P12M", "P1Y6M"
 *   - Plain English: "5 months", "1 year", "18 months"
 *   - Numeric strings: "12" (treated as months)
 */
function parseISODurationToMonths(term: string): number {
    if (!term) return 12;

    const s = term.trim();

    // Plain English: "5 months", "1 year 6 months", "18 months", "1 year"
    const yearWordMatch = s.match(/(\d+)\s*year/i);
    const monthWordMatch = s.match(/(\d+)\s*month/i);
    if (yearWordMatch || monthWordMatch) {
        const years = yearWordMatch ? parseInt(yearWordMatch[1], 10) : 0;
        const months = monthWordMatch ? parseInt(monthWordMatch[1], 10) : 0;
        return years * 12 + months || 12;
    }

    // ISO 8601: P1Y6M, P12M, P1Y
    if (s.startsWith('P')) {
        const yearMatch = s.match(/(\d+)Y/);
        const monthMatch = s.match(/(\d+)M/);
        const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
        const months = monthMatch ? parseInt(monthMatch[1], 10) : 0;
        return years * 12 + months || 12;
    }

    // Pure numeric: treat as months
    const numeric = parseInt(s, 10);
    return isNaN(numeric) ? 12 : numeric;
}

/**
 * Calculates the SETTLEMENT_AMOUNT based on BAP_TERMS fee parameters and loan data.
 * All inputs are read from sessionData saved during search and on_select_1.
 */
export function calculateSettlementAmount(sessionData: any): string {
    const feeType = sessionData.buyer_finder_fees_type || "percent-annualized";
    const feePercentage = parseFloat(sessionData.buyer_finder_fees_percentage || "0");
    const feeAmount = parseFloat(sessionData.buyer_finder_fees_amount || "0");

    const principalAmount = parseFloat(sessionData.principal_amount || "0");
    const totalLoanAmount = parseFloat(sessionData.quote_price || "0");

    const loanTermISO = sessionData.loan_term || "P12M";
    const loanTermMonths = parseISODurationToMonths(loanTermISO);

    let settlementAmount = 0;

    switch (feeType) {
        case "amount":
            settlementAmount = feeAmount;
            console.log(`[settlement-utils] amount type → ${settlementAmount}`);
            break;

        case "percent":
            // ⚠️ confirm with spec: using principal here
            settlementAmount = (feePercentage / 100) * principalAmount;
            console.log(`[settlement-utils] percent type → ${feePercentage}% × ${principalAmount} = ${settlementAmount}`);
            break;

        case "percent-annualized":
        default:
            // ✅ Correct ONDC logic
            settlementAmount =
                (feePercentage / 100) *
                (loanTermMonths / 12) *
                principalAmount;

            console.log(
                `[settlement-utils] percent-annualized type → ${feePercentage}% × (${loanTermMonths}/12) × ${principalAmount} = ${settlementAmount}`
            );
            break;
    }

    // ✅ safer rounding (2 decimal then round)
    const result = String(Math.round(settlementAmount));
    console.log(`[settlement-utils] Final SETTLEMENT_AMOUNT = ${result}`);
    return result;
}

/**
 * Injects the settlement amount into all payment tags containing SETTLEMENT_AMOUNT.
 * Uses sessionData.settlement_amount if already stored, otherwise calculates it fresh.
 */
export function injectSettlementAmount(existingPayload: any, sessionData: any): string {
    const settlementAmount =
        sessionData.settlement_amount ?? calculateSettlementAmount(sessionData);

    const payments: any[] = existingPayload?.message?.order?.payments || [];

    payments.forEach((payment: any) => {
        if (!Array.isArray(payment?.tags)) return;

        payment.tags.forEach((tag: any) => {
            if (Array.isArray(tag?.list)) {
                const item = tag.list.find(
                    (i: any) => i?.descriptor?.code === "SETTLEMENT_AMOUNT"
                );
                if (item) {
                    item.value = settlementAmount;
                    console.log(`[settlement-utils] Injected SETTLEMENT_AMOUNT = ${settlementAmount}`);
                }
            }
        });
    });

    return settlementAmount;
}