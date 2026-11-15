export interface MemoOptions {
  /** How long a result is reused. */
  readonly ttlMs: number;
  /** Most distinct argument lists kept. The oldest is dropped first. */
  readonly max?: number;
  readonly now?: () => number;
}

type MemoArgument = string | number | boolean | null | undefined;

export interface Memoized<Arguments extends MemoArgument[], Value> {
  (...args: Arguments): Promise<Value>;
  /** Forget everything, after a write that changes the answers. */
  clear(): void;
}

/**
 * Reuse the result of an async function for a while. Concurrent callers
 * with the same arguments share one call, and a failed call is not
 * cached, so the next caller retries.
 */
export function memoize<Arguments extends MemoArgument[], Value>(
  load: (...args: Arguments) => Promise<Value>,
  options: MemoOptions,
): Memoized<Arguments, Value> {
  const max = options.max ?? 256;
  const now = options.now ?? Date.now;
  const entries = new Map<string, { readonly expires: number; readonly value: Promise<Value> }>();

  function memoized(...args: Arguments): Promise<Value> {
    const key = JSON.stringify(args);
    const hit = entries.get(key);

    if (hit && hit.expires > now()) return hit.value;

    const value = load(...args);

    entries.delete(key);
    entries.set(key, { expires: now() + options.ttlMs, value });
    value.catch(() => {
      if (entries.get(key)?.value === value) entries.delete(key);
    });

    const oldest = entries.keys().next();

    if (entries.size > max && !oldest.done) entries.delete(oldest.value);

    return value;
  }

  return Object.assign(memoized, { clear: () => entries.clear() });
}
