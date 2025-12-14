/**
 * Centralized JWT Secret Management
 *
 * SECURITY: This module ensures JWT_SECRET is always present and never falls back
 * to a hardcoded default. The application will fail fast if the secret is missing.
 */

if (!process.env.JWT_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set. ' +
    'Application cannot start without this. Please set JWT_SECRET in your environment variables.'
  );
}

/**
 * Get JWT secret as Uint8Array for jose library
 * This is the format required by the jose library for JWT signing/verification
 */
export const getJWTSecret = (): Uint8Array => {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
};

/**
 * Get JWT secret as string
 * Use this for libraries that expect a string secret
 */
export const getJWTSecretString = (): string => {
  return process.env.JWT_SECRET!;
};
