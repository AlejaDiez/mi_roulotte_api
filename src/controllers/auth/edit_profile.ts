import { UsersTable } from "@db/schemas";
import { EditUser, User } from "@models/auth";
import { hash } from "@utils/crypto";
import { filterColumns } from "@utils/filter_object";
import { DrizzleQueryError } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm/sql";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { ZodError } from "zod";

export const editProfile: Handler<Env> = async (ctx) => {
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

    try {
        const body = EditUser.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .update(UsersTable)
            .set({
                username: body.username,
                password: body.password ? await hash(body.password) : undefined
            })
            .where(eq(UsersTable.id, ctx.var.uid))
            .returning(filterColumns(columns, fields));

        // Update user
        const data: any = await query.get();

        return ctx.json(User.parse(data), 200);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: "Impossible to update profile"
            });
        throw err;
    }
};
