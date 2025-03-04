import { listDatasources } from "@data/datasource/data";

type InjectedDatasources<T> = {
  [K in keyof T]: T[K] extends () => infer R ? R : never;
};

type Datasources = InjectedDatasources<typeof listDatasources>;

export function injectionDatasources() {
  return Object.keys(listDatasources).reduce((acc, key) => {
    const keyDatasource = key as keyof typeof listDatasources;
    const datasource = listDatasources[keyDatasource];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    acc[keyDatasource] = datasource();

    return acc;
  }, {} as Datasources);
}

const datasources = injectionDatasources();

export { datasources, Datasources };
