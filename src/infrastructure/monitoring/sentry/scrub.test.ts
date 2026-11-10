import { redactSearch, scrub, scrubEvent } from "./scrub";

describe("redactSearch", () => {
  it("SHOULD redact q wherever it appears", () => {
    expect(redactSearch("/v1/t?from=a&q=milk%20x&to=b")).toBe(
      "/v1/t?from=a&q=[redacted]&to=b",
    );
    expect(redactSearch("/v1/t?q=a&q=b")).toBe(
      "/v1/t?q=[redacted]&q=[redacted]",
    );
  });
});

describe("scrub", () => {
  it.each([
    "password",
    "Token",
    "refreshToken",
    "accessToken",
    "Authorization",
    "email",
    "name",
    "description",
    "notes",
    "amount",
    "body",
  ])("SHOULD drop the key %s", (key) => {
    expect(
      scrub({ keep: 1, [key]: "x", nested: { [key]: "x", ok: true } }),
    ).toEqual({ keep: 1, nested: { ok: true } });
  });

  it("SHOULD not throw on circular values", () => {
    const value: Record<string, unknown> = { a: 1 };
    value.self = value;

    expect(scrub(value)).toEqual({ a: 1, self: "[circular]" });
  });

  it("SHOULD keep the key names of variableKeys", () => {
    expect(scrub({ variableKeys: ["amount", "description"] })).toEqual({
      variableKeys: ["amount", "description"],
    });
  });
});

describe("scrubEvent", () => {
  it("SHOULD strip body, cookies and sensitive headers and redact q", () => {
    const event = scrubEvent({
      breadcrumbs: [{ data: { url: "/a?q=secret" } }],
      request: {
        cookies: { s: "1" },
        data: { amount: 1 },
        headers: { accept: "json", Authorization: "Bearer x", cookie: "c" },
        query_string: "q=secret&from=1",
        url: "/a?q=secret",
      },
      user: { email: "a@b.c", id: "u1" },
    });

    expect(event.request).toEqual({
      headers: { accept: "json" },
      query_string: "q=[redacted]&from=1",
      url: "/a?q=[redacted]",
    });
    expect(event.breadcrumbs).toEqual([{ data: { url: "/a?q=[redacted]" } }]);
    expect(event.user).toEqual({ id: "u1" });
  });
});
