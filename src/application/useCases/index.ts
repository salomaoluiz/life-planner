import { repositories } from "@data/repositories";
import Repositories from "@domain/repositories";

import { listUseCases } from "./cases";

type InjectedUseCases<T> = {
  [K in keyof T]: T[K] extends (repositories: Repositories) => infer R
    ? R
    : never;
};

interface Props {
  repositories: Repositories;
}

type UseCases = typeof listUseCases;

export function injectionUseCases(props: Props) {
  return Object.entries(listUseCases).reduce((acc, [key, useCase]) => {
    const keyUseCase = key as keyof UseCases;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error

    acc[keyUseCase] = useCase(props.repositories);

    return acc;
  }, {} as InjectedUseCases<UseCases>);
}

const useCases = injectionUseCases({
  repositories,
});

export { useCases };
