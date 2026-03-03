/**
 * Authentication types matching backend DTOs
 * Backend location: backend-apply-ab-java/src/main/java/ca/applyalberta/api/dto/
 */

/**
 * Login request matching LoginRequest.java
 * Fields: email (required), password (required), totpCode (optional)
 */
export interface LoginRequest {
    email: string;
    password: string;
    totpCode?: string;
}

/**
 * Login response matching LoginResponse.java
 * Fields: token, userId (UUID), role (STAFF|ADMIN), refreshToken (optional)
 */
export interface LoginResponse {
    token: string;
    userId: string; // UUID as string
    role: string; // "STAFF" | "ADMIN"
    refreshToken?: string;
}

/**
 * JWT Payload structure matching JWT claims from JwtService.java
 * Standard JWT claims: sub (userId), role, roles, institutionId (optional for STAFF)
 * Additional claims: iss, iat, exp, jti
 */
export interface JwtPayload {
    // Standard JWT claims
    sub: string; // userId (UUID as string)
    iss?: string; // issuer
    iat?: number; // issued at (timestamp in seconds)
    exp?: number; // expiration (timestamp in seconds)
    jti?: string; // JWT ID

    // Custom claims
    role: string; // "STAFF" | "ADMIN"
    roles: string[]; // Spring roles: ["ROLE_STAFF"] or ["ROLE_ADMIN"]
    institutionId?: string; // UUID as string, only present for STAFF users (null for ADMIN)
}
