import { describe, it, expect } from "vitest";
import {
  MpesaError,
  MpesaAuthError,
  MpesaRequestError,
  MpesaValidationError,
} from "../src/errors/index.js";

describe("Mpesa errors", () => {
  it("MpesaError has code and optional statusCode/responseBody", () => {
    const err = new MpesaError("test", { code: "X", statusCode: 400, responseBody: {} });
    expect(err.message).toBe("test");
    expect(err.code).toBe("X");
    expect(err.statusCode).toBe(400);
    expect(err.responseBody).toEqual({});
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(MpesaError);
  });

  it("MpesaAuthError has MPESA_AUTH_ERROR code", () => {
    const err = new MpesaAuthError("auth failed");
    expect(err.name).toBe("MpesaAuthError");
    expect(err.code).toBe("MPESA_AUTH_ERROR");
  });

  it("MpesaRequestError has MPESA_REQUEST_ERROR code", () => {
    const err = new MpesaRequestError("request failed", { statusCode: 500 });
    expect(err.name).toBe("MpesaRequestError");
    expect(err.code).toBe("MPESA_REQUEST_ERROR");
    expect(err.statusCode).toBe(500);
  });

  it("MpesaValidationError has MPESA_VALIDATION_ERROR code", () => {
    const err = new MpesaValidationError("invalid input");
    expect(err.name).toBe("MpesaValidationError");
    expect(err.code).toBe("MPESA_VALIDATION_ERROR");
  });
});
