/**
 * STK Push (Lipa Na M-Pesa Online) and STK Query.
 */

import { HttpClient } from "../../http/client.js";
import { MpesaValidationError } from "../../errors/index.js";
import { validatePhone, requireNonEmpty, requirePositiveAmount, validateUrl } from "../../utils/validation.js";
import { getTimestamp, getStkPassword } from "../../utils/stk.js";
import type { StkPushInput, StkPushResponse, StkPushResult, StkQueryInput, StkQueryResponse } from "./types.js";

export interface StkModuleConfig {
  http: HttpClient;
  shortCode: string;
  passKey: string;
}

export function createStkModule(config: StkModuleConfig) {
  const { http, shortCode, passKey } = config;

  return {
    /**
     * Initiate STK Push (Lipa Na M-Pesa Online).
     * Sends a prompt to the customer's phone to enter M-Pesa PIN.
     * @returns CheckoutRequestID, timestamp, etc. – use checkoutRequestId and timestamp with stkQuery() to poll status
     */
    async push(input: StkPushInput): Promise<StkPushResult> {
      requireNonEmpty(input.phoneNumber, "phoneNumber");
      requirePositiveAmount(input.amount, "amount");
      validateUrl(input.callbackUrl, "callbackUrl");
      requireNonEmpty(input.accountReference, "accountReference");
      requireNonEmpty(input.transactionDesc, "transactionDesc");
      validatePhone(input.phoneNumber);

      const short = input.shortCode ?? shortCode;
      if (!short || !passKey) {
        throw new MpesaValidationError(
          "STK Push requires shortCode and passKey in config or input"
        );
      }

      const timestamp = getTimestamp();
      const password = getStkPassword(short, passKey, timestamp);
      const phone = input.phoneNumber.replace(/\D/g, "");
      const normalizedPhone =
        phone.length === 9 && phone.startsWith("7")
          ? `254${phone}`
          : phone.length === 10 && phone.startsWith("0")
            ? `254${phone.slice(1)}`
            : phone.length === 12
              ? phone
              : input.phoneNumber;

      const transactionType = input.transactionType ?? "CustomerPayBillOnline";

      const body = {
        BusinessShortCode: short,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.round(input.amount),
        PartyA: normalizedPhone,
        PartyB: short,
        PhoneNumber: normalizedPhone,
        CallBackURL: input.callbackUrl,
        AccountReference: input.accountReference,
        TransactionDesc: input.transactionDesc,
      };

      const response = await http.post<StkPushResponse>("/mpesa/stkpush/v1/processrequest", body);
      return { ...response, timestamp };
    },

    /**
     * Query status of an STK Push using CheckoutRequestID.
     * Pass the timestamp from stkPush() so the request password matches the original push.
     */
    async query(input: StkQueryInput): Promise<StkQueryResponse> {
      requireNonEmpty(input.checkoutRequestId, "checkoutRequestId");

      const short = input.shortCode ?? shortCode;
      if (!short || !passKey) {
        throw new MpesaValidationError("STK Query requires shortCode and passKey in config");
      }

      const timestamp = input.timestamp ?? getTimestamp();
      const password = getStkPassword(short, passKey, timestamp);

      const body = {
        BusinessShortCode: short,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: input.checkoutRequestId,
      };

      return http.post<StkQueryResponse>("/mpesa/stkpushquery/v1/query", body);
    },
  };
}
