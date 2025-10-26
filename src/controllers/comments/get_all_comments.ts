import { CommentsTable } from "@db/schemas";
import { Comment } from "@models/comments";
import { filterColumns } from "@utils/filter_object";
import { desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Handler } from "hono/types";

export const buildRelatedComments = (comments: any[], fields?: string[]) => {
    const map = new Map(
        comments.map((c) => [
            c.id,
            {
                ...c,
                replies: []
            }
        ])
    );

    return comments.reduce<any[]>((acc, comment) => {
        let { id, repliedTo, ...rest } = map.get(comment.id);
        const parent = repliedTo ? map.get(repliedTo) : null;

        if (parent) {
            parent.replies?.push(Comment.filter(fields).parse({ id, ...rest }));
        } else {
            acc.push(Comment.filter(fields).parse({ id, ...rest }));
        }
        return acc;
    }, []);
};

export const getAllComments: Handler<Env> = async (ctx) => {
    const fields = ctx.req.query("fields")?.split(",");
    const columns = {
        username: CommentsTable.username,
        content: CommentsTable.content,
        url: sql<string>`
            CASE 
                WHEN ${CommentsTable.stageId} IS NULL THEN 
                    CONCAT(${ctx.env.HOST}, '/', ${CommentsTable.tripId}, '/#', ${CommentsTable.id})
                ELSE 
                    CONCAT(${ctx.env.HOST}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})
            END`,
        createdAt: CommentsTable.createdAt,
        updatedAt: CommentsTable.updatedAt
    };
    const query = drizzle(ctx.env.DB)
        .select({
            id: CommentsTable.id,
            repliedTo: CommentsTable.repliedTo,
            ...filterColumns(columns, fields)
        })
        .from(CommentsTable)
        .orderBy(desc(sql`COALESCE(${CommentsTable.updatedAt}, ${CommentsTable.createdAt})`));

    // Get all comments
    const data = await query.then((e) => buildRelatedComments(e, fields));

    return ctx.json(data, 200);
};
