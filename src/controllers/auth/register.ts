import { UsersTable } from "@db/schemas";
import verifyEmailTemplate from "@emails/verify_email";
import { RegisterUser, User } from "@models/auth";
import { generateToken, hash } from "@utils/crypto";
import { filterColumns } from "@utils/filter_object";
import { DrizzleQueryError } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { Resend } from "resend";
import { ZodError } from "zod";

export const register: Handler<{ Bindings: Env }> = async (ctx) => {
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
        const body = RegisterUser.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .insert(UsersTable)
            .values({
                username: body.username,
                email: body.email,
                password: await hash(body.password)
            })
            .returning(filterColumns(columns, fields));

        // Register the user
        const data: any = await query.get();

        // Send verification email
        const token = await generateToken(
            { id: data.id },
            ctx.env.VERIFY_EMAIL_SECRET,
            60 * 30 // 30 mins
        );

        await new Resend(ctx.env.EMAIL_TOKEN).emails.send({
            from: "Mi Roulotte <no-reply@miroulotte.es>",
            to: [data.email],
            subject: "Activate Your Account",
            html: verifyEmailTemplate({
                username: data.username,
                url: `${ctx.env.STUDIO_HOST}/verify-email?token=${token}`
            })
        });

        return ctx.json(User.parse(data), 201);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: "Impossible to register user with the provided data"
            });
        throw err;
    }
};
