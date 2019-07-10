"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VerifyError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
    ;
}
exports.VerifyError = VerifyError;
//# sourceMappingURL=verify.error.js.map