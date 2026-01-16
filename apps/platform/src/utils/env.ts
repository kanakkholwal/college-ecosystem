// doesn't work on edge runtime
export const getEnvironment = () => {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return "browser";
  } else if (
    typeof process !== "undefined" &&
    typeof process?.versions !== "undefined"
  ) {
    return "node";
  } else {
    return "unknown";
  }
};
export const getEnvironmentDev = () => {
  if (getEnvironment() === "browser") {
    return process.env.NEXT_PUBLIC_ENV !== "production";
  }
  return process.env.NODE_ENV !== "production";
};
