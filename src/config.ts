/**
 * SDK configuration and base URLs.
 */

export type Environment = "sandbox" | "production";

export function getBaseUrl(environment: Environment): string {
  return environment === "sandbox"
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";
}

export interface MpesaConfig {
  /** Consumer key from Daraja portal. */
  consumerKey: string;
  /** Consumer secret from Daraja portal. */
  consumerSecret: string;
  /** Environment: sandbox (testing) or production. */
  environment: Environment;
  /** Shortcode (Paybill or Till). Required for STK Push, C2B, B2C, account balance. */
  shortCode?: string;
  /** Lipa Na M-Pesa passkey. Required for STK Push and STK Query. */
  passKey?: string;
  /** B2C initiator name (API operator username). Required for B2C. */
  initiatorName?: string;
  /** B2C security credential (encrypted initiator password). Required for B2C. */
  securityCredential?: string;
}
