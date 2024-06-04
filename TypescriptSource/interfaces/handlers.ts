import type { LoanID } from "./types";

export interface Handlers {
    init_task?: (data: LoanID) => void;
    GetNotes?: (data: LoanID) => void;
}