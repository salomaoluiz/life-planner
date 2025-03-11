import Repositories from "@domain/repositories";

export type IUseCaseWithParam<P, R> = (param: P) => Promise<R>;

export type IUseCaseWithoutParam<R> = () => Promise<R>;

export type IUseCaseFactoryWithParamResponse<P, R> = {
  execute: IUseCaseWithParam<P, R>;
};
export type IUseCaseFactoryWithParam<P, R> = (
  repositories: Repositories,
) => IUseCaseFactoryWithParamResponse<P, R>;

export type IUseCaseFactoryWithoutParamResponse<R> = {
  execute: IUseCaseWithoutParam<R>;
};

export type IUseCaseFactoryWithoutParam<R> = (
  repositories: Repositories,
) => IUseCaseFactoryWithoutParamResponse<R>;
