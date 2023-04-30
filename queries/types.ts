import { QueryFunctionContext } from "@tanstack/react-query";

export type QueryPropsHelper<
  T extends Record<string, (...args: any[]) => readonly [any]>,
  K extends keyof T
> = QueryFunctionContext<ReturnType<T[K]>>;
