import { CommentsTable, StagesTable, TripsTable } from "@db/schemas";
import replyCommentTemplate from "@emails/reply_comment";
import { Comment, ReplyComment } from "@models/comments";
import { generateToken } from "@utils/crypto";
import { filterColumns } from "@utils/filter_object";
import { DrizzleQueryError } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, sql } from "drizzle-orm/sql";
import { getConnInfo } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { Resend } from "resend";
import { ZodError } from "zod";

export const replyComment: Handler<Env> = async (ctx) => {
    console.log("add");

    const parentCommentId = ctx.req.param("comment_id");
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
        const body = ReplyComment.parse(await ctx.req.json());

        // Check if exists parent comment
        const parentCommentQuery = drizzle(ctx.env.DB)
            .select(columns)
            .from(CommentsTable)
            .where(eq(CommentsTable.id, parentCommentId));
        const parentCommentData = await parentCommentQuery.get();

        if (!parentCommentData)
            throw new HTTPException(400, {
                message: `Comment with id '${parentCommentId}' does not exist`
            });

        // Check if is possible to add a reply
        const postQuery = parentCommentData.stageId
            ? drizzle(ctx.env.DB)
                  .select({
                      title: StagesTable.title,
                      allowComments: StagesTable.allowComments
                  })
                  .from(StagesTable)
                  .where(
                      and(
                          eq(StagesTable.id, parentCommentData.stageId),
                          eq(StagesTable.tripId, parentCommentData.tripId)
                      )
                  )
            : drizzle(ctx.env.DB)
                  .select({
                      title: TripsTable.title,
                      allowComments: TripsTable.allowComments
                  })
                  .from(TripsTable)
                  .where(eq(TripsTable.id, parentCommentData.tripId));
        const postData = await postQuery.get();

        if (postData === undefined)
            throw new HTTPException(400, {
                message: parentCommentData.stageId
                    ? `Stage with id '${parentCommentData.stageId}' and trip id '${parentCommentData.tripId}' does not exist`
                    : `Trip with id '${parentCommentData.tripId}' does not exist`
            });
        if (!postData.allowComments)
            throw new HTTPException(403, {
                message: parentCommentData.stageId
                    ? `Stage with id '${parentCommentData.stageId}' and trip id '${parentCommentData.tripId}' does not allow comments`
                    : `Trip with id '${parentCommentData.tripId}' does not allow comments`
            });

        // Create a new reply to parent comment
        const query = drizzle(ctx.env.DB)
            .insert(CommentsTable)
            .values({
                tripId: parentCommentData.tripId,
                stageId: parentCommentData.stageId,
                username: body.username,
                email: body.email,
                content: body.content,
                repliedTo: parentCommentData.id,
                userAgent: ctx.req.header("User-Agent"),
                ipAddress: getConnInfo(ctx).remote.address
            })
            .returning(filterColumns(columns, fields));
        const data: any = await query.get();

        // Send notification email
        if (data && parentCommentData.email) {
            // Generate unsubscribe token
            const token = await generateToken(
                { id: parentCommentData.id },
                ctx.env.UNSUBSCRIBE_SECRET,
                60 * 60 * 24 * 7 // 7 days
            );

            await new Resend(ctx.env.EMAIL_TOKEN).emails.send({
                from: "Mi Roulotte <no-reply@miroulotte.es>",
                to: [parentCommentData.email],
                subject: `New Response to Your Comment in “${postData.title}”`,
                html: replyCommentTemplate({
                    username: parentCommentData.username,
                    post: postData.title,
                    originalComment: parentCommentData.content,
                    replySnippet: data.content,
                    url: parentCommentData.url,
                    unsubscribeUrl: `${ctx.env.STUDIO_HOST}/unsubscribe-notifications?token=${token}`
                })
            });
        }

        return ctx.json(Comment.parse(data), 201);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: `Impossible to create a new reply to comment with id ${parentCommentId}`
            });
        throw err;
    }
};
