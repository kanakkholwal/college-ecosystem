/** True for MongoDB's E11000 duplicate key error, including bulk write wrappers. */
export function isDuplicateKeyError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { code, writeErrors } = err as {
    code?: unknown;
    writeErrors?: { code?: unknown }[];
  };
  return (
    code === 11000 ||
    (Array.isArray(writeErrors) && writeErrors.some((e) => e?.code === 11000))
  );
}
