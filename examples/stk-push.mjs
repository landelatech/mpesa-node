/**
 * Example: STK Push (Lipa Na M-Pesa Online) and STK Query.
 *
 * Run: node examples/stk-push.mjs
 * Ensure .env has MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASS_KEY, MPESA_SHORT_CODE.
 */

import "dotenv/config";
import { Mpesa } from "../dist/index.js";

const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT || "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
  passKey: process.env.MPESA_PASS_KEY,
});

async function main() {
  // 1. Initiate STK Push
  const res = await mpesa.stkPush({
    phoneNumber: "254708374149",
    amount: 10,
    callbackUrl: "https://your-domain.com/stk-callback",
    accountReference: "order-123",
    transactionDesc: "Payment example",
  });

  console.log("STK Push response:", res);
  console.log("CheckoutRequestID:", res.CheckoutRequestID);

  // 2. Poll status (in real flow you might poll until ResultCode is 0 or non-pending)
  const status = await mpesa.stkQuery({ checkoutRequestId: res.CheckoutRequestID });
  console.log("STK Query response:", status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
