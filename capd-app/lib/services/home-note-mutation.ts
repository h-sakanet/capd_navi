import { upsertRecord } from "@/lib/storage/record.repo";
import { type HomeExchangeNote } from "@/lib/storage/models";

export async function saveHomeExchange(
    sessionId: string,
    dateLocal: string,
    exchangeNo: number,
    updates: Partial<HomeExchangeNote>
): Promise<void> {
    const now = new Date().toISOString();

    const promises: Promise<void>[] = [];

    const createRecord = (event: string, payload: Record<string, unknown>) => {
        return upsertRecord({
            recordId: `manual_${dateLocal}_ex${exchangeNo}_${event}`,
            sessionId,
            dateLocal,
            stepId: "manual_edit",
            recordEvent: event,
            recordExchangeNo: String(exchangeNo),
            recordUnit: "home_note",
            payload,
            createdAtIso: now,
            updatedAtIso: now
        });
    };

    if (updates.dwellStart !== undefined) {
        promises.push(createRecord("manual_dwell_start", { value: updates.dwellStart }));
    }
    if (updates.dwellEnd !== undefined) {
        promises.push(createRecord("manual_dwell_end", { value: updates.dwellEnd }));
    }
    if (updates.drainStart !== undefined) {
        promises.push(createRecord("manual_drain_start", { value: updates.drainStart }));
    }
    if (updates.drainEnd !== undefined) {
        promises.push(createRecord("manual_drain_end", { value: updates.drainEnd }));
    }
    if (updates.csvTitle !== undefined) {
        promises.push(createRecord("manual_conc_title", { value: updates.csvTitle }));
    }
    if (updates.drainWeightG !== undefined) {
        promises.push(createRecord("drain_weight_g", { value: updates.drainWeightG }));
    }
    if (updates.bagWeightG !== undefined) {
        promises.push(createRecord("bag_weight_g", { value: updates.bagWeightG }));
    }
    if (updates.drainAppearance !== undefined) {
        promises.push(createRecord("drain_appearance", { drainAppearance: updates.drainAppearance }));
    }

    await Promise.all(promises);
}

export async function saveHomeSummary(
    sessionId: string,
    dateLocal: string,
    updates: {
        bodyWeightKg?: number | null;
        urineMl?: number | null;
        fluidIntakeMl?: number | null;
        stoolCountPerDay?: number | null;
        bpSys?: number | null;
        bpDia?: number | null;
        exitSiteStatus?: string;
        notes?: string;
    }
): Promise<void> {
    const now = new Date().toISOString();

    // Use session_summary event but with single values as understood by query service
    await upsertRecord({
        recordId: `manual_${dateLocal}_summary`,
        sessionId,
        dateLocal,
        stepId: "manual_edit",
        recordEvent: "session_summary",
        recordExchangeNo: "summary",
        recordUnit: "home_note",
        payload: {
            bodyWeightKg: updates.bodyWeightKg,
            urineMl: updates.urineMl,
            fluidIntakeMl: updates.fluidIntakeMl,
            stoolCountPerDay: updates.stoolCountPerDay,
            bpSys: updates.bpSys,
            bpDia: updates.bpDia,
            // For exitSiteStatus, split the comma-separated string back to array
            exitSiteStatuses: updates.exitSiteStatus
                ? updates.exitSiteStatus.split(", ").filter(Boolean)
                : [],
            note: updates.notes
        },
        createdAtIso: now,
        updatedAtIso: now
    });
}
