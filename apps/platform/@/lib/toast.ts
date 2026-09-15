import type { CSSProperties, ReactNode } from "react";
import { toast as sonner } from "sonner";

/** Toasts from this module render in the `<Toaster id={APP_TOASTER_ID} />` mounted in app/provider.tsx. */
export const APP_TOASTER_ID = "app";

type ToastId = string | number;
type Message = ReactNode | ((t: { id: ToastId }) => ReactNode);
type Options = {
  id?: ToastId;
  duration?: number;
  icon?: ReactNode;
  style?: CSSProperties;
};
type PromiseMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((err: unknown) => ReactNode);
};

let nextId = 0;

function withToaster(options?: Options) {
  return { ...options, toasterId: APP_TOASTER_ID };
}

function resolve<T>(value: ReactNode | ((arg: T) => ReactNode), arg: T) {
  return typeof value === "function" ? value(arg) : value;
}

function show(message: Message, options?: Options): ToastId {
  if (typeof message !== "function") {
    return sonner(message, withToaster(options));
  }
  // Render functions need their toast id up front so they can dismiss themselves.
  const id = options?.id ?? `app-toast-${++nextId}`;
  return sonner(() => message({ id }), withToaster({ ...options, id }));
}

/** react-hot-toast compatible subset of the API, backed by sonner. */
export const toast = Object.assign(show, {
  success: (message: ReactNode, options?: Options) =>
    sonner.success(message, withToaster(options)),
  error: (message: ReactNode, options?: Options) =>
    sonner.error(message, withToaster(options)),
  loading: (message: ReactNode, options?: Options) =>
    sonner.loading(message, withToaster(options)),
  dismiss: (id?: ToastId) => {
    sonner.dismiss(id);
  },
  // Unlike sonner's, this returns the original promise so callers can await it and see rejections.
  promise: <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: Options
  ): Promise<T> => {
    const id = sonner.loading(messages.loading, withToaster(options));
    promise.then(
      (data) =>
        sonner.success(
          resolve(messages.success, data),
          withToaster({ ...options, id })
        ),
      (err) =>
        sonner.error(
          resolve(messages.error, err),
          withToaster({ ...options, id })
        )
    );
    return promise;
  },
});

export default toast;
