import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

/**
 * Generates a short 6-char hex suffix for readable IDs.
 */
function shortId(): string {
    return randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
}

export async function on_searchDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_search Generator Start ===");

    // Update context timestamps
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        if (sessionData.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
        if (sessionData.message_id) existingPayload.context.message_id = sessionData.message_id;
    }

    const providers = existingPayload.message?.catalog?.providers;
    if (!providers || !Array.isArray(providers)) {
        console.log("No providers found, returning as-is.");
        return existingPayload;
    }

    for (const provider of providers) {
        // ── Provider ID ──────────────────────────────────────────────────────────
        const provSuffix = shortId();
        provider.id = `SCH_PROVIDER_${provSuffix}`;

        // ── Categories: build a map from old ID → new semantic ID ────────────────
        const catIdMap: Record<string, string> = {};
        if (provider.categories && Array.isArray(provider.categories)) {
            for (const cat of provider.categories) {
                const code: string = cat.descriptor?.code ?? 'CAT';
                // e.g. CAT_OPEN_ENDED_EQUITY_ABC123
                const newCatId = `CAT_${code}_${shortId()}`;
                catIdMap[cat.id] = newCatId;
                cat.id = newCatId;
                // Update parent_category_id reference
                if (cat.parent_category_id && catIdMap[cat.parent_category_id]) {
                    cat.parent_category_id = catIdMap[cat.parent_category_id];
                }
            }
        }

        // ── Fulfillments: build a map from old ID → new semantic ID ──────────────
        const ffIdMap: Record<string, string> = {};
        if (provider.fulfillments && Array.isArray(provider.fulfillments)) {
            for (const ff of provider.fulfillments) {
                const type: string = ff.type ?? 'FF';
                // e.g. FF_SIP_MONTHLY_ABC123 — derive sub-type from frequency tag if present
                let subType = '';
                const freqTag = ff.tags?.find((t: any) => t.descriptor?.code === 'THRESHOLDS');
                const freqItem = freqTag?.list?.find((l: any) => l.descriptor?.code === 'FREQUENCY');
                if (freqItem?.value === 'P1M') subType = '_MONTHLY';
                else if (freqItem?.value === 'P1D') {
                    const dayTypeItem = freqTag?.list?.find((l: any) => l.descriptor?.code === 'FREQUENCY_DAY_TYPE');
                    subType = dayTypeItem?.value === 'BUSINESS' ? '_DAILY_BUSINESS' : '_DAILY_CALENDAR';
                }
                const newFfId = `FF_${type}${subType}_${shortId()}`;
                ffIdMap[ff.id] = newFfId;
                ff.id = newFfId;
            }
        }

        // ── Items: two passes ─────────────────────────────────────────────────────
        // Pass 1: assign new IDs to all items (scheme + plan), build map
        const itemIdMap: Record<string, string> = {};
        if (provider.items && Array.isArray(provider.items)) {
            for (const item of provider.items) {
                const code: string = item.descriptor?.code ?? 'ITEM';
                let newItemId: string;
                if (code === 'SCHEME') {
                    // e.g. SCH_ABC_MIDCAP_XY1234
                    const namePart = (item.descriptor?.name ?? 'FUND')
                        .toUpperCase().replace(/[^A-Z0-9]+/g, '_').substring(0, 20);
                    newItemId = `SCH_${namePart}_${shortId()}`;
                } else {
                    // SCHEME_PLAN or other — e.g. PLAN_ABC_MIDCAP_REG_GROWTH_XY1234
                    const namePart = (item.descriptor?.name ?? 'PLAN')
                        .toUpperCase().replace(/[^A-Z0-9]+/g, '_').substring(0, 30);
                    newItemId = `PLAN_${namePart}_${shortId()}`;
                }
                itemIdMap[item.id] = newItemId;
                item.id = newItemId;
            }

            // Pass 2: fix cross-references using maps
            for (const item of provider.items) {
                // Update category_ids → new cat IDs
                if (item.category_ids && Array.isArray(item.category_ids)) {
                    item.category_ids = item.category_ids.map(
                        (cid: string) => catIdMap[cid] ?? cid
                    );
                }
                // Update parent_item_id → new scheme ID
                if (item.parent_item_id) {
                    item.parent_item_id = itemIdMap[item.parent_item_id] ?? item.parent_item_id;
                }
                // Update fulfillment_ids → new FF IDs
                if (item.fulfillment_ids && Array.isArray(item.fulfillment_ids)) {
                    item.fulfillment_ids = item.fulfillment_ids.map(
                        (fid: string) => ffIdMap[fid] ?? fid
                    );
                }
            }
        }

        console.log("Provider ID:", provider.id);
        console.log("Category ID map:", catIdMap);
        console.log("Item ID map:", itemIdMap);
        console.log("Fulfillment ID map:", ffIdMap);
    }

    console.log("=== on_search Generator End ===");
    return existingPayload;
}
