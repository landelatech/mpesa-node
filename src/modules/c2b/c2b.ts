/**
 * C2B: Register URLs and simulate (sandbox).
 */

import { HttpClient } from "../../http/client.js";
import { MpesaValidationError } from "../../errors/index.js";
import { validatePhone, validateUrl, requirePositiveAmount, requireNonEmpty } from "../../utils/validation.js";
import type {
  C2BRegisterUrlsInput,
  C2BRegisterUrlsResponse,
  C2BSimulateInput,
  C2BSimulateResponse,
} from "./types.js";

export interface C2BModuleConfig {
  http: HttpClient;
  shortCode: string;
}

export function createC2BModule(config: C2BModuleConfig) {
  const { http, shortCode } = config;

  return {
    /**
     * Register confirmation and validation URLs for C2B (paybill/till).
     * Call once per shortcode; use Daraja portal to change later.
     */
    async registerUrls(input: C2BRegisterUrlsInput): Promise<C2BRegisterUrlsResponse> {
      validateUrl(input.confirmationUrl, "confirmationUrl");
      validateUrl(input.validationUrl, "validationUrl");

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("C2B registerUrls requires shortCode in config");
      }

      const body = {
        ShortCode: short,
        ResponseType: input.responseType ?? "Completed",
        ConfirmationURL: input.confirmationUrl,
        ValidationURL: input.validationUrl,
      };

      return http.post<C2BRegisterUrlsResponse>("/mpesa/c2b/v1/registerurl", body);
    },

    /**
     * Simulate a C2B payment (sandbox only).
     * Registers a simulated payment to your paybill/till for testing.
     */
    async simulate(input: C2BSimulateInput): Promise<C2BSimulateResponse> {
      requirePositiveAmount(input.amount, "amount");
      requireNonEmpty(input.msisdn, "msisdn");
      validatePhone(input.msisdn);

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("C2B simulate requires shortCode in config");
      }

      const msisdn = input.msisdn.replace(/\D/g, "");
      const normalized =
        msisdn.length === 9 && msisdn.startsWith("7")
          ? `254${msisdn}`
          : msisdn.length === 10 && msisdn.startsWith("0")
            ? `254${msisdn.slice(1)}`
            : msisdn.length === 12 && msisdn.startsWith("254")
              ? msisdn
              : msisdn.length === 12
                ? msisdn
                : `254${msisdn}`;

      const body: Record<string, string | number> = {
        ShortCode: short,
        CommandID: input.commandId ?? "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        Msisdn: normalized,
      };
      if (input.billRefNumber !== undefined && input.billRefNumber !== "") {
        body.BillRefNumber = input.billRefNumber;
      }

      return http.post<C2BSimulateResponse>("/mpesa/c2b/v1/simulate", body);
    },
  };
}
