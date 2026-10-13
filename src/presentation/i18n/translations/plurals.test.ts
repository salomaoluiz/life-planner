import enUS from "./en-US";
import ptBR from "./pt-BR";

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") {
    return { [prefix]: value };
  }
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (all, [key, child]) => ({
      ...all,
      ...flatten(child, prefix ? `${prefix}.${key}` : key),
    }),
    {},
  );
}

const languages = {
  "en-US": flatten(enUS.translation),
  "pt-BR": flatten(ptBR.translation),
};

describe.each(Object.entries(languages))("%s", (_language, keys) => {
  it("SHOULD have an _other sibling for every _one key and the reverse", () => {
    const ones = Object.keys(keys).filter((key) => key.endsWith("_one"));
    const others = Object.keys(keys).filter((key) => key.endsWith("_other"));

    expect(ones.map((key) => key.replace(/_one$/, "")).sort()).toEqual(
      others.map((key) => key.replace(/_other$/, "")).sort(),
    );
  });

  it.each([
    ["home.stock.count", "1 item", "0 items"],
    ["stock.list.subtitle", "1 item", "0 items"],
    ["financial.categories.subcount", "1 sub", "0 sub"],
    ["family.card.membersOwner", "1 mem", "0 mem"],
    ["family.card.membersOwnerYou", "1 mem", "0 mem"],
  ])("SHOULD define singular for 1 and plural for 0 in %s", (key) => {
    expect(keys[`${key}_one`]).toMatch(/^1 /);
    expect(keys[`${key}_other`]).toMatch(/^\{\{count\}\} /);
  });
});
