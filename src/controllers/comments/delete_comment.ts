import { CommentsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const deleteComment: Handler<Env> = async (ctx) => {
    const commentId = ctx.req.param("comment_id");
    const query = drizzle(ctx.env.DB)
        .delete(CommentsTable)
        .where(eq(CommentsTable.id, commentId))
        .returning({ id: CommentsTable.id });
    // Delete comment
    const data = await query.get();

    if (!data)
        throw new HTTPException(404, { message: `Comment with id '${commentId}' not found` });
    return ctx.body(null, 204);
};
