import Repositories from "@domain/repositories";

export type IUseCaseFactoryWithoutParam<R> = (
  repositories: Repositories,
) => IUseCaseFactoryWithoutParamResponse<R>;

export type IUseCaseFactoryWithoutParamResponse<R> = {
  execute: IUseCaseWithoutParam<R>;
  uniqueName: string;
};

export type IUseCaseFactoryWithParam<P, R> = (
  repositories: Repositories,
) => IUseCaseFactoryWithParamResponse<P, R>;
export type IUseCaseFactoryWithParamResponse<P, R> = {
  execute: IUseCaseWithParam<P, R>;
  uniqueName: string;
};

export type IUseCaseWithoutParam<R> = () => Promise<R>;

export type IUseCaseWithParam<P, R> = (param: P) => Promise<R>;
