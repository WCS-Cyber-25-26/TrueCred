import crypto from "crypto";

const SESSION_LENGTH = 32;

export function generateSessionToken() {
    return crypto.randomBytes(SESSION_LENGTH).toString('hex');
}

export function hashSessionToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}