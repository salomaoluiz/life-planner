import { listRepositories } from "./repos";

import Repositories from "@domain/repositories";
import { datasources, Datasources } from "@data/datasource";

type InjectedRepositories<T> = {
  [K in keyof T]: T[K] extends () => infer R ? R : never;
};

interface Props {
  dataSources: Datasources;
}

export function injectionRepository(props: Props) {
  return Object.keys(listRepositories).reduce((acc, key) => {
    const keyRepository = key as keyof Repositories;
    const repository = listRepositories[keyRepository];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    acc[keyRepository] = repository(props.dataSources);

    return acc;
  }, {} as InjectedRepositories<Repositories>);
}

const repositories = injectionRepository({
  dataSources: datasources,
});

export { repositories };
