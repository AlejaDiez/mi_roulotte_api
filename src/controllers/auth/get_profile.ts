import { UsersTable } from "@db/schemas";
import { User } from "@models/auth";
import { filterColumns } from "@utils/filter_object";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Handler } from "hono/types";

export const getProfile: Handler<Env> = async (ctx) => {
    const fields = ctx.req.query("fields")?.split(",");
    const columns = {
        id: UsersTable.id,
        username: UsersTable.username,
        email: UsersTable.email,
        role: UsersTable.role,
        isActive: UsersTable.isActive,
        emailVerified: UsersTable.emailVerified,
        twoFactorAuthentication: UsersTable.twoFactorAuthentication,
        createdAt: UsersTable.createdAt,
        updatedAt: UsersTable.updatedAt
    };
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(UsersTable)
        .where(eq(UsersTable.id, ctx.var.uid));

    // Get user date
    const data = await query.get();

    return ctx.json(User.parse(data), 200);
};
