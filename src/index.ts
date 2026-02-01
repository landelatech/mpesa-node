/**
 * @landelatech/mpesa-node
 *
 * Production-ready Node.js SDK for Safaricom M-Pesa Daraja APIs.
 * Fluent API, automatic OAuth, zero boilerplate.
 *
 * @example
 * ```ts
 * import { Mpesa } from "@landelatech/mpesa-node";
 *
 * const mpesa = new Mpesa({
 *   consumerKey: process.env.MPESA_CONSUMER_KEY!,
 *   consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
 *   environment: "sandbox",
 *   shortCode: "174379",
 *   passKey: process.env.MPESA_PASS_KEY!,
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

export { Mpesa } from "./clients/mpesa-client.js";
export type { MpesaConfig, ResolvedMpesaConfig } from "./config.js";
export type { Environment } from "./config.js";
export { MPESA_ENV_KEYS, resolveConfig } from "./config.js";
export {
  MpesaError,
  MpesaAuthError,
  MpesaRequestError,
  MpesaValidationError,
} from "./errors/index.js";

// Callbacks: typed payloads, parsers, and optional receiver
export {
  MpesaCallbackError,
  parseStkPushCallback,
  getStkMetadata,
  parseC2BConfirmation,
  parseC2BValidation,
  c2bValidationResponse,
  C2B_VALIDATION_ACCEPT,
  C2B_VALIDATION_REJECT,
  parseDarajaResult,
  getResultParametersMap,
  createCallbackHandler,
  stkPushRoute,
  c2BConfirmationRoute,
  c2BValidationRoute,
  darajaResultRoute,
} from "./callbacks/index.js";
export type {
  CallbackItem,
  StkPushCallbackPayload,
  StkPushSuccessMetadata,
  C2BConfirmationPayload,
  C2BValidationPayload,
  C2BValidationResponse,
  DarajaResultPayload,
  ResultParametersMap,
  CallbackRoute,
  CallbackResponseOverride,
  CreateCallbackHandlerOptions,
} from "./callbacks/index.js";

// Module input/output types for consumers
export type { StkPushInput, StkPushResponse, StkPushResult, StkQueryInput, StkQueryResponse } from "./modules/stk/types.js";
export type {
  C2BRegisterUrlsInput,
  C2BRegisterUrlsResponse,
  C2BSimulateInput,
  C2BSimulateResponse,
} from "./modules/c2b/types.js";
export type { B2CSendInput, B2CSendResponse } from "./modules/b2c/types.js";
export type { AccountBalanceInput, AccountBalanceResponse } from "./modules/account/types.js";
export type { TransactionStatusInput, TransactionStatusResponse } from "./modules/transaction/types.js";
