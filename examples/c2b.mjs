/**
 * Example: C2B – register URLs and simulate (sandbox).
 *
 * Run: node examples/c2b.mjs
 * Ensure .env has MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORT_CODE.
 */

import "dotenv/config";
import { Mpesa } from "../dist/index.js";

const mpesa = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: "sandbox",
  shortCode: process.env.MPESA_SHORT_CODE,
});

async function main() {
  // 1. Register confirmation and validation URLs (once per shortcode)
  const registerRes = await mpesa.c2b.registerUrls({
    confirmationUrl: "https://your-domain.com/c2b/confirm",
    validationUrl: "https://your-domain.com/c2b/validate",
    responseType: "Completed",
  });
  console.log("Register URLs:", registerRes);

  // 2. Simulate a C2B payment (sandbox only)
  const simRes = await mpesa.c2b.simulate({
    amount: 100,
    msisdn: "254708374149",
    billRefNumber: "ref-001",
  });
  console.log("Simulate:", simRes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
