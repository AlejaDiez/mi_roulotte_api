import { OTPsTable, SessionsTable, UsersTable } from "@db/schemas";
import verifyTwoFactorAuth from "@emails/verify_two_factor_auth";
import { LoginUser } from "@models/auth";
import { compareHash, generateHash, generateToken } from "@utils/crypto";
import { DrizzleQueryError, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getConnInfo } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { Resend } from "resend";
import { ZodError } from "zod";

export const login: Handler<{ Bindings: Env }> = async (ctx) => {
    const columns = {
        id: UsersTable.id,
        username: UsersTable.username,
        role: UsersTable.role,
        email: UsersTable.email,
        password: UsersTable.password,
        isActive: UsersTable.isActive,
        emailVerified: UsersTable.emailVerified,
        twoFactorAuthentication: UsersTable.twoFactorAuthentication
    };

    try {
        const body = LoginUser.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .select(columns)
            .from(UsersTable)
            .where(eq(UsersTable.email, body.email));
        const data = await query.get();

        // Check that user exists and password is correct
        if (!data || !(await compareHash(body.password, data.password)))
            throw new HTTPException(401, {
                message: "Invalid email or password"
            });
        // Check that user is active
        if (!data.isActive)
            throw new HTTPException(403, {
                message: "Your account has been disabled"
            });
        // Check that email is verified
        if (!data.emailVerified)
            throw new HTTPException(403, {
                message: "Email not verified"
            });
        // Check 2FA
        if (data.twoFactorAuthentication) {
            const deleteOTPQuery = drizzle(ctx.env.DB)
                .delete(OTPsTable)
                .where(eq(OTPsTable.uid, data.id));
            const createOTPQuery = drizzle(ctx.env.DB)
                .insert(OTPsTable)
                .values({
                    uid: data.id,
                    expiresAt: sql`(unixepoch() + ${60 * 7})` // 7 min
                })
                .returning({
                    code: OTPsTable.code
                });

            // Delete current OTP code
            await deleteOTPQuery;

            // Create new OTP code
            const otpData = await createOTPQuery.get();
            const token = await generateToken(
                {
                    id: data.id,
                    username: data.username,
                    role: data.role
                },
                ctx.env.VERIFY_2FA_SECRET,
                60 * 7 // 7 min
            );

            // Send email with code
            await new Resend(ctx.env.EMAIL_TOKEN).emails.send({
                from: "Mi Roulotte <no-reply@miroulotte.es>",
                to: [data.email],
                subject: "Your 2FA Code",
                html: verifyTwoFactorAuth({
                    username: data.username,
                    code: otpData.code
                })
            });
            return ctx.json(
                {
                    error: "Two-factor authentication required. Please provide the verification code that was sent to your email to continue.",
                    token
                },
                403
            );
        }

        // Create session
        const sessionQuery = drizzle(ctx.env.DB)
            .insert(SessionsTable)
            .values({
                uid: data.id,
                refresh: generateHash(),
                userAgent: ctx.req.header("User-Agent"),
                ipAddress: getConnInfo(ctx).remote.address,
                expiresAt: sql`(unixepoch() + ${60 * 60 * 24 * 30})` // 30 days,
            })
            .returning({
                id: SessionsTable.id,
                uid: SessionsTable.uid,
                refresh: SessionsTable.refresh
            });
        const sessionData = await sessionQuery.get();

        // Create tokens
        const token = await generateToken(
            {
                id: data.id,
                username: data.username,
                role: data.role
            },
            ctx.env.AUTH_SECRET,
            60 * 15 // 15 min
        );
        const refreshToken = await generateToken(
            {
                id: sessionData.id,
                uid: sessionData.uid,
                refresh: sessionData.refresh
            },
            ctx.env.REFRESH_AUTH_SECRET,
            60 * 60 * 24 * 30 // 30 days
        );

        return ctx.json(
            {
                token,
                refreshToken
            },
            200
        );
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
