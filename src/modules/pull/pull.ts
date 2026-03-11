/**
 * Pull Transactions API – register a shortcode and query recent transactions.
 */

import { MpesaValidationError } from "../../errors";
import type { HttpClient } from "../../http";
import {
  normalizePhone,
  requireNonEmpty,
  validatePhone,
  validateUrl,
} from "../../utils/validation";
import type {
  PullModule,
  PullQueryInput,
  PullQueryResponse,
  PullRegisterInput,
  PullRegisterResponse,
  PullTransactionRecord,
} from "./types";

export interface PullModuleConfig {
  http: HttpClient;
  shortCode: string;
}

interface RawPullQueryResponse {
  ResponseRefID: string;
  ResponseCode: string | number;
  ResponseDescription?: string;
  ResponseStatus?: string | number;
  Transactions?: PullTransactionRecord[];
  transactions?: PullTransactionRecord[];
  [key: string]: unknown;
}

const DARAJA_PULL_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function validatePullDateTime(value: string, name: string): void {
  requireNonEmpty(value, name);
  if (!DARAJA_PULL_DATETIME_REGEX.test(value)) {
    throw new MpesaValidationError(`${name} must use YYYY-MM-DD HH:MM:SS format, got: ${value}`);
  }
}

function requireNonNegativeInt(value: number | undefined, name: string): number {
  if (value === undefined || value === null) {
    return 0;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
    throw new MpesaValidationError(`${name} must be a non-negative integer, got: ${value}`);
  }
  return n;
}

function normalizePullTransactionsResponse(response: RawPullQueryResponse): PullQueryResponse {
  return {
    ...response,
    Transactions: response.Transactions ?? response.transactions ?? [],
  };
}

export function createPullModule(config: PullModuleConfig): PullModule {
  const { http, shortCode } = config;

  return {
    /**
     * Register a shortcode and nominated Safaricom number for pull-transaction access.
     */
    async register(input: PullRegisterInput): Promise<PullRegisterResponse> {
      validatePhone(input.nominatedNumber);
      validateUrl(input.callbackUrl, "callbackUrl");

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("Pull register requires shortCode in config");
      }

      return http.post<PullRegisterResponse>("/pulltransactions/v1/register", {
        ShortCode: short,
        RequestType: "Pull",
        NominatedNumber: normalizePhone(input.nominatedNumber),
        CallBackURL: input.callbackUrl,
      });
    },

    /**
     * Query recent transactions for a registered shortcode.
     */
    async query(input: PullQueryInput): Promise<PullQueryResponse> {
      validatePullDateTime(input.startDate, "startDate");
      validatePullDateTime(input.endDate, "endDate");

      if (input.startDate > input.endDate) {
        throw new MpesaValidationError("startDate must be before or equal to endDate");
      }

      if ((input.filterType && !input.filterValue) || (!input.filterType && input.filterValue)) {
        throw new MpesaValidationError(
          "filterType and filterValue must be provided together for pull queries"
        );
      }

      const short = input.shortCode ?? shortCode;
      if (!short) {
        throw new MpesaValidationError("Pull query requires shortCode in config");
      }

      const body: Record<string, string | number> = {
        ShortCode: short,
        StartDate: input.startDate,
        EndDate: input.endDate,
        OffSetValue: requireNonNegativeInt(input.offSetValue, "offSetValue"),
      };

      if (input.filterType && input.filterValue) {
        body.FilterType = input.filterType;
        body.FilterValue = input.filterValue;
      }

      const response = await http.post<RawPullQueryResponse>("/pulltransactions/v1/query", body);
      return normalizePullTransactionsResponse(response);
    },
  };
}
