import { CommentsTable } from "@db/schemas";
import { Comment } from "@models/comments";
import { canFilter, filterColumns, subFields } from "@utils/filter_object";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq, sql } from "drizzle-orm/sql";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const getCommentById: Handler<Env> = async (ctx) => {
    const commentId = ctx.req.param("comment_id");
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
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(CommentsTable)
        .where(eq(CommentsTable.id, commentId));

    // Run query
    const data: any = await query.get();

    if (!data)
        throw new HTTPException(404, { message: `Comment with id '${commentId}' not found` });

    // Get replies
    if (canFilter("replies", fields)) {
        const columns = {
            id: CommentsTable.id,
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
            userAgent: CommentsTable.userAgent,
            ipAddress: CommentsTable.ipAddress,
            createdAt: CommentsTable.createdAt,
            updatedAt: CommentsTable.updatedAt
        };
        const query = drizzle(ctx.env.DB)
            .select(filterColumns(columns, subFields("replies", fields)))
            .from(CommentsTable)
            .where(eq(CommentsTable.repliedTo, commentId))
            .orderBy(desc(sql`COALESCE(${CommentsTable.updatedAt}, ${CommentsTable.createdAt})`));

        data.replies = await query.then((e) => e.map((e) => Comment.parse(e)));
    }
    return ctx.json(Comment.parse(data), 200);
};
