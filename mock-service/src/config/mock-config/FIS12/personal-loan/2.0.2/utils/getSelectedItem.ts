export function getSelectedItem(sessionData: any): any {
    if (sessionData.item) {
        return sessionData.item;
    }

    if (Array.isArray(sessionData.items) && sessionData.items.length > 0) {
        // Prioritise the AA item (aa_personal_loan_ prefix)
        const aaItem = sessionData.items.find(
            (item: any) => item?.id && item.id.startsWith("aa_personal_loan_")
        );
        if (aaItem) {
            return aaItem;
        }
        // Fallback to first item (bureau or generic)
        return sessionData.items[0];
    }

    return undefined;
}
