import { inspect } from "node:util";

const REDACTED = "[redacted]";

/**
 * A value that must not reach a log, an error message or a JSON
 * response by accident. Printing or serialising it gives `[redacted]`;
 * `reveal()` is the one way to the value.
 */
export class Sensitive<Value> {
  readonly #value: Value;

  constructor(value: Value) {
    this.#value = value;
  }

  reveal(): Value {
    return this.#value;
  }

  toString(): string {
    return REDACTED;
  }

  toJSON(): string {
    return REDACTED;
  }

  [inspect.custom](): string {
    return REDACTED;
  }
}

export function sensitive<Value>(value: Value): Sensitive<Value> {
  return new Sensitive(value);
}
