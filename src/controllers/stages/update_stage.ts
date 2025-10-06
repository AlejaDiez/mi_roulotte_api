import { StagesTable, TripsTable } from "@db/schemas";
import { Stage, UpdateStage } from "@models/stages";
import { filterColumns } from "@utils/filter_object";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { ZodError } from "zod";

export const updateStage: Handler<Env> = async (ctx) => {
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
        url: sql`CONCAT(${ctx.env.HOST}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`,
        createdAt: StagesTable.createdAt,
        updatedAt: StagesTable.updatedAt
    };

    // Trip exists?
    const tripQuery = drizzle(ctx.env.DB)
        .select({ id: TripsTable.id })
        .from(TripsTable)
        .where(eq(TripsTable.id, tripId));
    const tripExists = await tripQuery.get();

    if (!tripExists)
        throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

    try {
        const body = UpdateStage.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .update(StagesTable)
            .set(body)
            .where(and(eq(StagesTable.id, stageId), eq(StagesTable.tripId, tripId)))
            .returning(filterColumns(columns, fields));

        // Update stage
        const data: any = await query.get();

        if (!data)
            throw new HTTPException(404, {
                message: `Stage with id '${stageId}' not found in trip with id '${tripId}'`
            });
        return ctx.json(Stage.parse(data), 200);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: `Impossible to update stage with id ${stageId} into trip with id '${tripId}'`
            });
        throw err;
    }
};
