import { Tone } from "@components/utils/tones";
import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";

type IncomeDisplayStatus = "OVERDUE" | "PLANNED" | "RECEIVED";

// Spec 107 FR 10: OVERDUE is only a presentation of a planned income whose payment date passed.
function displayStatus(income: InvestmentIncome): IncomeDisplayStatus {
  if (income.status === InvestmentIncomeStatus.RECEIVED) {
    return "RECEIVED";
  }

  return income.overdue ? "OVERDUE" : "PLANNED";
}

function statusTone(status: IncomeDisplayStatus): Tone {
  if (status === "RECEIVED") {
    return "income";
  }

  return status === "OVERDUE" ? "warning" : "neutral";
}

export { displayStatus, IncomeDisplayStatus, statusTone };
