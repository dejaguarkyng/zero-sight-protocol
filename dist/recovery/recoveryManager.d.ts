interface EncryptedPayload {
    iv: string;
    ciphertext: string;
    tag: string;
}
export declare function initiateRecovery(email: string, phone: string, encryptedWallet: EncryptedPayload, salt: Buffer | string): Promise<{
    otpEmail: string;
    otpSMS: string;
}>;
export declare function verifyRecovery(email: string, phone: string, emailOtp: string, smsOtp: string): boolean;
export declare function resetPin(email: string, phone: string, newPin: string): Promise<{
    newEncryptedWallet: EncryptedPayload;
    newSalt: string;
}>;
export {};
