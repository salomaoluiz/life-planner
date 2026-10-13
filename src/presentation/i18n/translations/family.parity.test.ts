import enUS from "./en-US";
import ptBR from "./pt-BR";

function keysOf(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key),
  );
}

it.each(["family", "invite"] as const)(
  "SHOULD pt-BR have exactly the same %s keys as en-US",
  (namespace) => {
    expect(keysOf(ptBR.translation[namespace]).sort()).toEqual(
      keysOf(enUS.translation[namespace]).sort(),
    );
  },
);
