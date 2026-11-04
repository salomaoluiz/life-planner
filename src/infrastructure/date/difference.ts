import { differenceInDays } from "date-fns/differenceInDays";
import { differenceInMilliseconds } from "date-fns/differenceInMilliseconds";
import { differenceInYears } from "date-fns/differenceInYears";

import { Duration } from "./types";

function difference(
  currentDate: Date,
  dateToCompare: Date,
  type: Duration,
): number {
  switch (type) {
    case Duration.days:
      return differenceInDays(currentDate, dateToCompare);
    case Duration.milliseconds:
      return differenceInMilliseconds(currentDate, dateToCompare);
    case Duration.years:
      return differenceInYears(currentDate, dateToCompare);
  }
}

export { difference };
