// Spec 102: every investment query key lives here, under one root, so a write invalidates exactly the screens it moves.
type Key = string[];

const ROOT = "investment";

export const investmentKeys = {
  all: (): Key => [ROOT],
  asset: (id: string): Key => [ROOT, "asset", id],
  assets: (status: string): Key => [ROOT, "assets", status],
};
