export interface SessionTokenResult {
    token: string;
    expiresAt: number;
}
export interface SessionVerificationResult {
    valid: boolean;
    userId?: string;
}
export declare function createSessionToken(userId: string): SessionTokenResult;
export declare function verifySessionToken(token: string): SessionVerificationResult;
