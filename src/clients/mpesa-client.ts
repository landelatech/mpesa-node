/**
 * Main M-Pesa SDK client: fluent API and module wiring.
 */

import { AuthProvider } from "../auth/index.js";
import { HttpClient } from "../http/client.js";
import { getBaseUrl, type MpesaConfig } from "../config.js";
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
 * const mpesa = new Mpesa({
 *   consumerKey: process.env.MPESA_CONSUMER_KEY!,
 *   consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
 *   environment: "sandbox",
 *   shortCode: "174379",
 *   passKey: process.env.MPESA_PASS_KEY!,
 * });
 *
 * const res = await mpesa.stkPush().push({
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

  constructor(config: MpesaConfig) {
    const auth = new AuthProvider({
      environment: config.environment,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
    });

    const baseUrl = getBaseUrl(config.environment);
    this.http = new HttpClient({
      baseUrl,
      getAccessToken: () => auth.getAccessToken(),
    });

    const shortCode = config.shortCode ?? "";
    const passKey = config.passKey ?? "";
    const initiatorName = config.initiatorName ?? "";
    const securityCredential = config.securityCredential ?? "";

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
