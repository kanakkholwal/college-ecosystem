import { z } from "zod";

import { Session } from "~/auth";
import { headers } from "next/headers";
import { auth } from "~/auth";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

// with Normal Payload
/*
 * Validated action function
 * This is useful for actions that require validation of payload
 * It combines the validation of payload with the action execution
 */

type ValidatedActionFn<S extends z.ZodType<any, any>, T, P> = (
  data: z.infer<S>,
  payload: P
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T, P>(
  schema: S,
  action: ValidatedActionFn<S, T, P>
) {
  return async (prevState: ActionState, payload: P) => {
    const result = schema.safeParse(payload);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }
    return action(result.data, payload);
  };
}

type ValidatedActionWithUserFn<S extends z.ZodType<any, any>, T, P> = (
  data: z.infer<S>,
  payload: P,
  session: Session
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T, P>(
  schema: S,
  action: ValidatedActionWithUserFn<S, T, P>
) {
  return async (prevState: ActionState, payload: P) => {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      throw new Error("User is not authenticated");
    }
    const result = schema.safeParse(payload);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }
    return action(result.data, payload, session);
  };
}
type ValidatedActionWithRolesFn<S extends z.ZodType<any, any>, T, P> = (
  data: z.infer<S>,
  payload: P,
  session: Session
) => Promise<T>;

export function validatedActionWithRoles<S extends z.ZodType<any, any>, T, P>(
  schema: S,
  allowedRoles: Array<
    Session["user"]["other_roles"][number] | Session["user"]["role"]
  >,
  action: ValidatedActionWithRolesFn<S, T, P>
) {
  return async (prevState: ActionState, payload: P) => {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) throw new Error("User is not authenticated");
    if (
      !allowedRoles.includes(session.user.role) &&
      !allowedRoles.some((role) => session.user.other_roles.includes(role))
    )
      throw new Error("User does not have required role");

    const result = schema.safeParse(payload);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    return action(result.data, payload, session);
  };
}
/*
 * Validated form action with user session
 * This is useful for actions that require user authentication and validation
 * It combines the validation of form data with the user session retrieval
 */

type ValidatedFormActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedFormAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedFormActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedFormActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  session: Session
) => Promise<T>;

export function validatedFormActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedFormActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      throw new Error("User is not authenticated");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    return action(result.data, formData, session);
  };
}
