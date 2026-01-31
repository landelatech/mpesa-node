/**
 * Transaction Status API types.
 */

export interface TransactionStatusInput {
  /** M-Pesa transaction ID (e.g. from callback). */
  transactionId: string;
  /** Result callback URL. */
  resultUrl: string;
  /** Timeout callback URL. */
  queueTimeOutUrl: string;
  /** Remarks (e.g. "Status check"). */
  remarks: string;
  /** Optional: shortcode override. */
  shortCode?: string;
  /** Identifier type: 1=MSISDN, 2=TILL, 4=ORGANIZATION. Default 4. */
  identifierType?: 1 | 2 | 4;
}

export interface TransactionStatusResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}
