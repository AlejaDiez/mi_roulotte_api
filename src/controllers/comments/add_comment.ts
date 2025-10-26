import { CommentsTable, StagesTable, TripsTable } from "@db/schemas";
import { Comment, InsertComment } from "@models/comments";
import { filterColumns } from "@utils/filter_object";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getConnInfo } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { ZodError } from "zod";

export const addComments: Handler<Env> = async (ctx) => {
    const fields = ctx.req.query("fields")?.split(",");
    const columns = {
        id: CommentsTable.id,
        tripId: CommentsTable.tripId,
        stageId: CommentsTable.stageId,
        username: CommentsTable.username,
        email: CommentsTable.email,
        content: CommentsTable.content,
        url: sql<string>`
            CASE 
                WHEN ${CommentsTable.stageId} IS NULL THEN 
                    CONCAT(${ctx.env.HOST}, '/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                ELSE 
                    CONCAT(${ctx.env.HOST}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
            END`,
        repliedTo: CommentsTable.repliedTo,
        // userAgent: CommentsTable.userAgent,
        // ipAddress: CommentsTable.ipAddress,
        createdAt: CommentsTable.createdAt,
        updatedAt: CommentsTable.updatedAt
    };

    try {
        const body = InsertComment.parse(await ctx.req.json());

        // Check if is possible to add a comment
        const allowCommentsQuery = body.stageId
            ? drizzle(ctx.env.DB)
                  .select({
                      allowComments: StagesTable.allowComments
                  })
                  .from(StagesTable)
                  .where(and(eq(StagesTable.id, body.stageId), eq(StagesTable.tripId, body.tripId)))
            : drizzle(ctx.env.DB)
                  .select({
                      allowComments: TripsTable.allowComments
                  })
                  .from(TripsTable)
                  .where(eq(TripsTable.id, body.tripId));
        const allowCommentsData = await allowCommentsQuery.get().then((e) => e?.allowComments);

        if (allowCommentsData === undefined)
            throw new HTTPException(400, {
                message: body.stageId
                    ? `Stage with id '${body.stageId}' and trip id '${body.tripId}' does not exist`
                    : `Trip with id '${body.tripId}' does not exist`
            });
        if (!allowCommentsData)
            throw new HTTPException(403, {
                message: body.stageId
                    ? `Stage with id '${body.stageId}' and trip id '${body.tripId}' does not allow comments`
                    : `Trip with id '${body.tripId}' does not allow comments`
            });

        // Create a new comment
        const query = drizzle(ctx.env.DB)
            .insert(CommentsTable)
            .values({
                tripId: body.tripId,
                stageId: body.stageId,
                username: body.username,
                email: body.email,
                content: body.content,
                userAgent: ctx.req.header("User-Agent"),
                ipAddress: getConnInfo(ctx).remote.address
            })
            .returning(filterColumns(columns, fields));
        const data: any = await query.get();

        return ctx.json(Comment.parse(data), 201);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: "Impossible to create a new comment"
            });
        throw err;
    }
};
