/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  IUseCaseFactoryWithoutParamResponse,
  IUseCaseFactoryWithParamResponse,
  IUseCaseWithoutParam,
  IUseCaseWithParam,
} from "./types";
import { useState } from "react";

type ExtractUseCaseFunction<T> =
  T extends IUseCaseFactoryWithParamResponse<infer P, infer R>
    ? IUseCaseWithParam<P, R>
    : T extends IUseCaseFactoryWithoutParamResponse<infer R>
      ? IUseCaseWithoutParam<R>
      : never;

function useUseCase<
  T extends
    | IUseCaseFactoryWithParamResponse<any, any>
    | IUseCaseFactoryWithoutParamResponse<any>,
>(useCase: T) {
  const [, setError] = useState();

  async function execute(
    ...args: Parameters<ExtractUseCaseFunction<T>>
  ): Promise<ReturnType<ExtractUseCaseFunction<T>> | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return (await useCase.execute(...args)) as ReturnType<
        ExtractUseCaseFunction<T>
      > | null;
    } catch (error) {
      setError(() => {
        throw error;
      });
      return null;
    }
  }

  return { execute };
}

export default useUseCase;
