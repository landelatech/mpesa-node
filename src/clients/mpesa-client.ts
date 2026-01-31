/**
 * Main M-Pesa SDK client: fluent API and module wiring.
 */

import { AuthProvider } from "../auth/index.js";
import { HttpClient } from "../http/client.js";
import { getBaseUrl, resolveConfig, type MpesaConfig } from "../config.js";
import { createStkModule } from "../modules/stk/stk.js";
import { createC2BModule } from "../modules/c2b/c2b.js";
import { createB2CModule } from "../modules/b2c/b2c.js";
import { createAccountModule } from "../modules/account/account.js";
import { createTransactionModule } from "../modules/transaction/transaction.js";

/**
 * M-Pesa SDK client.
 *
 * Single entry point for all Daraja API operations. OAuth is handled automatically;
 * tokens are cached and refreshed before expiry.
 *
 * @example
 * ```ts
 * // With env vars (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, etc. set):
 * const mpesa = new Mpesa({});
 *
 * // Or with explicit config:
 * const mpesa = new Mpesa({
 *   consumerKey: "...",
 *   consumerSecret: "...",
 *   environment: "sandbox",
 *   shortCode: "174379",
 *   passKey: "...",
 * });
 *
 * const res = await mpesa.stkPush({
 *   phoneNumber: "254708374149",
 *   amount: 10,
 *   callbackUrl: "https://example.com/callback",
 *   accountReference: "order-123",
 *   transactionDesc: "Payment",
 * });
 * console.log(res.CheckoutRequestID);
 * ```
 */
export class Mpesa {
  private readonly http: HttpClient;

  private readonly stk: ReturnType<typeof createStkModule>;
  readonly c2b: ReturnType<typeof createC2BModule>;
  readonly b2c: ReturnType<typeof createB2CModule>;
  readonly account: ReturnType<typeof createAccountModule>;
  readonly transaction: ReturnType<typeof createTransactionModule>;

  constructor(config: MpesaConfig = {}) {
    const resolved = resolveConfig(config);

    const auth = new AuthProvider({
      environment: resolved.environment,
      consumerKey: resolved.consumerKey,
      consumerSecret: resolved.consumerSecret,
    });

    const baseUrl = getBaseUrl(resolved.environment);
    this.http = new HttpClient({
      baseUrl,
      getAccessToken: () => auth.getAccessToken(),
    });

    const shortCode = resolved.shortCode;
    const passKey = resolved.passKey;
    const initiatorName = resolved.initiatorName;
    const securityCredential = resolved.securityCredential;

    this.stk = createStkModule({ http: this.http, shortCode, passKey });
    this.c2b = createC2BModule({ http: this.http, shortCode });
    this.b2c = createB2CModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.account = createAccountModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
    this.transaction = createTransactionModule({
      http: this.http,
      shortCode,
      initiatorName,
      securityCredential,
    });
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online).
   * Sends a prompt to the customer's phone; use the returned CheckoutRequestID with stkQuery().
   */
  async stkPush(
    input: Parameters<ReturnType<typeof createStkModule>["push"]>[0]
  ): Promise<ReturnType<ReturnType<typeof createStkModule>["push"]>> {
    return this.stk.push(input);
  }

  /**
   * Query STK Push status using CheckoutRequestID from stkPush() response.
   */
  async stkQuery(
    input: Parameters<ReturnType<typeof createStkModule>["query"]>[0]
  ): Promise<ReturnType<ReturnType<typeof createStkModule>["query"]>> {
    return this.stk.query(input);
  }
}
