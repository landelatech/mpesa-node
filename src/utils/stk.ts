/**
 * STK password and timestamp generation for Lipa Na M-Pesa.
 */

/** Format: YYYYMMDDHHmmss */
export function getTimestamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}${M}${D}${h}${m}${s}`;
}

/** Base64(Shortcode + Passkey + Timestamp). */
export function getStkPassword(shortCode: string, passKey: string, timestamp: string): string {
  return Buffer.from(`${shortCode}${passKey}${timestamp}`, "utf8").toString("base64");
}
