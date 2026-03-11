import { beforeEach, describe, expect, it, vi } from "vitest";
import { Mpesa } from "../src/index.js";
import { MpesaValidationError } from "../src/errors/index.js";

describe("Mpesa Pull Transactions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const mockToken = () =>
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ access_token: "token", expires_in: "3599" })),
    } as Response);

  const baseConfig = {
    consumerKey: "key",
    consumerSecret: "secret",
    environment: "sandbox" as const,
    shortCode: "600000",
  };

  it("registers a shortcode for pull transactions", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ResponseRefID: "ref-1",
            ResponseStatus: 1000,
            ShortCode: "600000",
            ResponseDescription: "Shortcode Registered Successfully",
          })
        ),
    } as Response);

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.pull.register({
      nominatedNumber: "0700123456",
      callbackUrl: "https://example.com/mpesa/pull/register",
    });

    expect(res.ResponseStatus).toBe(1000);

    const postCall = vi.mocked(fetch).mock.calls.find((call) => call[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body).toEqual({
      ShortCode: "600000",
      RequestType: "Pull",
      NominatedNumber: "254700123456",
      CallBackURL: "https://example.com/mpesa/pull/register",
    });
  });

  it("queries recent transactions and normalizes the transactions list", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ResponseRefID: "ref-2",
            ResponseCode: 0,
            transactions: [
              {
                transactionId: "QWE123",
                trxDate: "2026-03-11T08:30:00Z",
                msisdn: "254700123456",
                transactiontype: "c2b-paybill-debit",
                billreference: "invoice-1",
                amount: 250,
                organizationname: "PesaKit Demo",
              },
            ],
          })
        ),
    } as Response);

    const mpesa = new Mpesa(baseConfig);
    const res = await mpesa.pull.query({
      startDate: "2026-03-10 08:00:00",
      endDate: "2026-03-11 08:00:00",
      offSetValue: 0,
    });

    expect(res.ResponseCode).toBe(0);
    expect(res.Transactions).toHaveLength(1);
    expect(res.Transactions[0]?.transactionId).toBe("QWE123");

    const postCall = vi.mocked(fetch).mock.calls.find((call) => call[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body).toEqual({
      ShortCode: "600000",
      StartDate: "2026-03-10 08:00:00",
      EndDate: "2026-03-11 08:00:00",
      OffSetValue: 0,
    });
  });

  it("includes filterType and filterValue together when querying", async () => {
    mockToken();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            ResponseRefID: "ref-3",
            ResponseCode: "1000",
            Transactions: [],
          })
        ),
    } as Response);

    const mpesa = new Mpesa(baseConfig);
    await mpesa.pull.query({
      startDate: "2026-03-10 08:00:00",
      endDate: "2026-03-11 08:00:00",
      filterType: "MSISDN",
      filterValue: "254700123456",
    });

    const postCall = vi.mocked(fetch).mock.calls.find((call) => call[1]?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.FilterType).toBe("MSISDN");
    expect(body.FilterValue).toBe("254700123456");
  });

  it("throws on invalid pull date format", async () => {
    const mpesa = new Mpesa(baseConfig);

    await expect(
      mpesa.pull.query({
        startDate: "2026-03-10",
        endDate: "2026-03-11 08:00:00",
      })
    ).rejects.toThrow(MpesaValidationError);
  });

  it("throws when filterType and filterValue are not paired", async () => {
    const mpesa = new Mpesa(baseConfig);

    await expect(
      mpesa.pull.query({
        startDate: "2026-03-10 08:00:00",
        endDate: "2026-03-11 08:00:00",
        filterType: "MSISDN",
      })
    ).rejects.toThrow(MpesaValidationError);
  });
});
