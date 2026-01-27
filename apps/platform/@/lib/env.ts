import { getBaseURL } from "~/utils/env";

export const getWindowOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getBaseURL();
};
