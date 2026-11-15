/**
 * Properties of an analytics event. Events never carry an email, a
 * name, or anything a user typed.
 */
export type EventProperties = Readonly<Record<string, string | number | boolean | null>>;
