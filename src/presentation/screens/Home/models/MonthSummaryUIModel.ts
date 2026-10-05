import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";

class MonthSummaryUIModel {
  get balanceType(): "EXPENSE" | undefined {
    return this.dto.balance < 0 ? "EXPENSE" : undefined;
  }

  get balanceValue() {
    return Math.abs(this.dto.balance);
  }

  get expense() {
    return this.dto.expense;
  }

  get income() {
    return this.dto.income;
  }

  get monthName() {
    return new Intl.DateTimeFormat(this.languageTag, { month: "long" }).format(
      this.month,
    );
  }

  constructor(
    private readonly dto: MonthSummaryDTO,
    private readonly month: Date,
    private readonly languageTag: string,
  ) {}
}

export default MonthSummaryUIModel;
