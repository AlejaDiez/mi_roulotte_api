import { Context } from "hono";
import { BlankInput } from "hono/types";

export const RoleHierarchy = {
    reader: 1,
    editor: 2,
    admin: 3
};

export const checkRole = (
    context: Context<Env, any, BlankInput>,
    role: keyof typeof RoleHierarchy,
    comparator: (user: number, required: number) => boolean
) => context.var.role && comparator(RoleHierarchy[context.var.role], RoleHierarchy[role]);
