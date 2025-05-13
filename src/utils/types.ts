/* Make objects deeply required

For example:

```typescript
type A = {
  a: {
    b?: {
      c?: string;
      d: number;
    };
  };
};

type B = DeepRequired<A>;

type value = {
  a: {
    b: {
      c: string;
      d: number;
    };
  };
};
```
*/
export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};
