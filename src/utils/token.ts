import type { JwtPayload } from '../types/auth';

/**
 * Parse JWT token and extract payload
 * Real JWT parsing - decodes the base64url-encoded payload from the token
 * 
 * @param token - JWT token string (format: header.payload.signature)
 * @returns Parsed JWT payload matching backend JwtService claims structure
 * @throws Error if token is invalid or cannot be parsed
 */
export function parseJwt(token: string): JwtPayload {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token: token must be a non-empty string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format: JWT must have 3 parts separated by dots');
    }

    try {
        // JWT uses base64url encoding, but atob can handle it after padding adjustment
        const base64Url = parts[1];

        // Add padding if needed (base64url may omit padding)
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        // Decode base64 to JSON string
        const json = atob(base64);

        // Parse JSON to JwtPayload
        const payload = JSON.parse(json) as JwtPayload;

        return payload;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Failed to parse JWT payload: ${error.message}`);
        }
        throw new Error(`Failed to decode JWT token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
