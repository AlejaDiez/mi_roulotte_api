import { buildRelatedComments } from "@controllers/comments/get_all_comments";
import { CommentsTable, StagesTable, TripsTable } from "@db/schemas";
import { Stage } from "@models/stages";
import { canFilter, filterColumns, subFields } from "@utils/filter_object";
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const getStageById: Handler<Env> = async (ctx, next) => {
    const tripId = ctx.req.param("trip_id");
    const stageId = ctx.req.param("stage_id");
    const fields = ctx.req.query("fields")?.split(",");
    const columns = {
        id: StagesTable.id,
        tripId: StagesTable.tripId,
        name: StagesTable.name,
        date: StagesTable.date,
        title: StagesTable.title,
        description: StagesTable.description,
        image: StagesTable.image,
        content: StagesTable.content,
        keywords: StagesTable.keywords,
        published: StagesTable.published,
        allowComments: StagesTable.allowComments,
        url: sql<string>`CONCAT(${ctx.env.HOST}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`,
        createdAt: StagesTable.createdAt,
        updatedAt: StagesTable.updatedAt
    };

    // Trip exists?
    const tripQuery = drizzle(ctx.env.DB)
        .select({ id: TripsTable.id })
        .from(TripsTable)
        .where(and(eq(TripsTable.id, tripId), eq(TripsTable.published, true)));
    const tripExists = await tripQuery.get();

    if (!tripExists)
        throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

    // Get stage
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(StagesTable)
        .where(
            and(
                eq(StagesTable.id, stageId),
                eq(StagesTable.tripId, tripId),
                eq(StagesTable.published, true)
            )
        );

    // Run query
    const data: any = await query.get();

    if (!data) throw new HTTPException(404, { message: `Stage with id '${stageId}' not found` });

    // Get comments
    if (canFilter("comments", fields)) {
        const subfields = subFields("comments", fields);
        const columns = {
            username: CommentsTable.username,
            content: CommentsTable.content,
            url: sql<string>`CONCAT(${ctx.env.HOST}, '/', ${CommentsTable.tripId}, '/', ${CommentsTable.stageId}, '/#', ${CommentsTable.id})`,
            createdAt: CommentsTable.createdAt,
            updatedAt: CommentsTable.updatedAt
        };
        const query = drizzle(ctx.env.DB)
            .select({
                id: CommentsTable.id,
                repliedTo: CommentsTable.repliedTo,
                ...filterColumns(columns, subfields)
            })
            .from(CommentsTable)
            .where(and(eq(CommentsTable.tripId, tripId), eq(CommentsTable.stageId, stageId)))
            .orderBy(desc(sql`COALESCE(${CommentsTable.updatedAt}, ${CommentsTable.createdAt})`));

        data.comments = await query.then((e) =>
            buildRelatedComments(e, subfields.length > 0 ? subfields : undefined)
        );
    }

    return ctx.json(Stage.parse(data), 200);
};
