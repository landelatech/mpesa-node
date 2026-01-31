/**
 * Transaction Status API – query status of a transaction.
 */

import { HttpClient } from "../../http/client.js";
import { MpesaValidationError } from "../../errors/index.js";
import { validateUrl, requireNonEmpty } from "../../utils/validation.js";
import type { TransactionStatusInput, TransactionStatusResponse } from "./types.js";

export interface TransactionModuleConfig {
  http: HttpClient;
  shortCode: string;
  /** Initiator name (same as B2C/account balance). */
  initiatorName: string;
  /** Encrypted initiator password (RSA). */
  securityCredential: string;
}

export function createTransactionModule(config: TransactionModuleConfig) {
  const { http, shortCode, initiatorName, securityCredential } = config;

  return {
    /**
     * Query transaction status. Daraja sends the result to resultUrl (async callback).
     * Use when you did not receive or lost the original callback.
     */
    async status(input: TransactionStatusInput): Promise<TransactionStatusResponse> {
      requireNonEmpty(input.transactionId, "transactionId");
      validateUrl(input.resultUrl, "resultUrl");
      validateUrl(input.queueTimeOutUrl, "queueTimeOutUrl");
      requireNonEmpty(input.remarks, "remarks");

      const short = input.shortCode ?? shortCode;
      if (!short || !initiatorName || !securityCredential) {
        throw new MpesaValidationError(
          "Transaction status requires shortCode, initiatorName, and securityCredential in config"
        );
      }

      const identifierType = input.identifierType ?? 4;

      const body = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: "TransactionStatusQuery",
        TransactionID: input.transactionId,
        PartyA: short,
        IdentifierType: identifierType,
        ResultURL: input.resultUrl,
        QueueTimeOutURL: input.queueTimeOutUrl,
        Remarks: input.remarks,
      };

      return http.post<TransactionStatusResponse>("/mpesa/transactionstatus/v1/query", body);
    },
  };
}
