/**
 * What a server action or a service function returns when failing is a
 * normal outcome the caller must handle: a taken name, a locked account.
 * Throw for everything else.
 */
export type Result<Value, Reason extends string = string> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly reason: Reason; readonly message: string };

export function ok(): Result<void, never>;
export function ok<Value>(value: Value): Result<Value, never>;
export function ok<Value>(value?: Value): Result<Value | undefined, never> {
  return { ok: true, value };
}

/** `reason` is a snake_case code the caller branches on; `message` is shown to the user. */
export function fail<Reason extends string>(reason: Reason, message: string): Result<never, Reason> {
  return { ok: false, reason, message };
}
