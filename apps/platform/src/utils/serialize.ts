/** Deep-copies to plain JSON so Mongoose docs, ObjectIds and Dates can cross to client components. */
export function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
