class StockMovementModel {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly quantity: number,
    readonly lotId: string,
    readonly createdAt: Date,
    readonly reason?: string,
    readonly note?: string,
    readonly user?: { id: string; name: string },
  ) {}

  static fromJSON(data: Record<string, unknown>): StockMovementModel {
    const user = data.user as null | undefined | { id: string; name: string };

    return new StockMovementModel(
      data.id as string,
      data.type as string,
      data.quantity as number,
      data.lotId as string,
      new Date(data.createdAt as string),
      optionalString(data.reason),
      optionalString(data.note),
      user ? { id: user.id, name: user.name } : undefined,
    );
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default StockMovementModel;
