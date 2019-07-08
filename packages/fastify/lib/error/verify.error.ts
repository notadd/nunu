export class VerifyError extends Error {
    message: string;
    status: number;
    constructor(message: string, status: number) {
        super();
        this.message = message;
        this.status = status;
    };
}