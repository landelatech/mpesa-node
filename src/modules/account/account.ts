/**
 * Account Balance API – request balance callback.
 */

import { HttpClient } from "../../http/client.js";
import { MpesaValidationError } from "../../errors/index.js";
import { validateUrl } from "../../utils/validation.js";
import type { AccountBalanceInput, AccountBalanceResponse } from "./types.js";

export interface AccountModuleConfig {
  http: HttpClient;
  shortCode: string;
  /** Required for account balance: initiator name from M-Pesa portal. */
  initiatorName: string;
  /** Required for account balance: encrypted initiator password (RSA). */
  securityCredential: string;
}

export function createAccountModule(config: AccountModuleConfig) {
  const { http, shortCode, initiatorName, securityCredential } = config;

  return {
    /**
     * Request account balance. Daraja sends the result to resultUrl (async callback).
     * Use the ConversationID to correlate the callback.
     */
    async balance(input: AccountBalanceInput): Promise<AccountBalanceResponse> {
      validateUrl(input.resultUrl, "resultUrl");
      validateUrl(input.queueTimeOutUrl, "queueTimeOutUrl");

      const short = input.shortCode ?? shortCode;
      if (!short || !initiatorName || !securityCredential) {
        throw new MpesaValidationError(
          "Account balance requires shortCode, initiatorName, and securityCredential in config"
        );
      }

      const identifierType = input.identifierType ?? 4;

      const body = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: "AccountBalance",
        PartyA: short,
        IdentifierType: identifierType,
        ResultURL: input.resultUrl,
        QueueTimeOutURL: input.queueTimeOutUrl,
      };

      return http.post<AccountBalanceResponse>("/mpesa/accountbalance/v1/query", body);
    },
  };
}
