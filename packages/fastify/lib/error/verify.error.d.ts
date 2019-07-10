export declare class VerifyError extends Error {
    message: string;
    status: number;
    constructor(message: string, status: number);
}
