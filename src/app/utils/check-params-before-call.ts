import { Observable, throwError } from 'rxjs';

const checkParamsBeforeCall = <T extends any[], RT>(
  callback: (...args: { [K in keyof T]: NonNullable<T[K]> }) => RT,
  ...params: T
): RT | Observable<never> => {
  if (params.some((p) => p === undefined || p === null)) {
    return throwError(
      () =>
        new Error(`
        Missing parameters, most likely not binded from router params.
        Check config and make sure u use withComponentInputBinding().
        If u are user, go kill yourself or person who wrote this, i dont care
        `),
    );
  }

  // We know that params are not null or undefined, but TS doesn't know that, so we cast them
  return (callback as any)(...params);
};

export default checkParamsBeforeCall;
