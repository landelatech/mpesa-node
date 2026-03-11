/**
 * Pull Transactions API types.
 */

export interface PullRegisterInput {
  /** Safaricom MSISDN nominated for the pull-transactions service. */
  nominatedNumber: string;
  /** HTTPS callback used for registration confirmations and notifications. */
  callbackUrl: string;
  /** Optional: shortcode override. */
  shortCode?: string;
}

export interface PullRegisterResponse {
  ResponseRefID: string;
  ResponseStatus: string | number;
  ShortCode: string;
  ResponseDescription: string;
}

export type PullFilterType = string;

export interface PullQueryInput {
  /** Inclusive start date in `YYYY-MM-DD HH:MM:SS` format. */
  startDate: string;
  /** Inclusive end date in `YYYY-MM-DD HH:MM:SS` format. */
  endDate: string;
  /** Optional filter type supplied by Daraja for narrower queries. */
  filterType?: PullFilterType;
  /** Optional filter value matching the selected filter type. */
  filterValue?: string;
  /** Pagination offset. Use 0 for the first page. */
  offSetValue?: number;
  /** Optional: shortcode override. */
  shortCode?: string;
}

export interface PullTransactionRecord {
  transactionId: string;
  trxDate: string;
  msisdn: string;
  transactiontype: string;
  billreference?: string;
  amount: number | string;
  organizationname?: string;
  [key: string]: unknown;
}

export interface PullQueryResponse {
  ResponseRefID: string;
  ResponseCode: string | number;
  ResponseDescription?: string;
  ResponseStatus?: string | number;
  Transactions: PullTransactionRecord[];
  [key: string]: unknown;
}

/** Public pull-transactions module surface exposed on `Mpesa`. */
export interface PullModule {
  register(input: PullRegisterInput): Promise<PullRegisterResponse>;
  query(input: PullQueryInput): Promise<PullQueryResponse>;
}
