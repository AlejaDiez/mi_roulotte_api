import { StagesTable, TripsTable } from "@db/schemas";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const deleteStage: Handler<Env> = async (ctx) => {
    const tripId = ctx.req.param("trip_id");
    const stageId = ctx.req.param("stage_id");

    // Trip exists?
    const tripQuery = drizzle(ctx.env.DB)
        .select({ id: TripsTable.id })
        .from(TripsTable)
        .where(eq(TripsTable.id, tripId));
    const tripExists = await tripQuery.get();

    if (!tripExists)
        throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

    // Delete stage
    const query = drizzle(ctx.env.DB)
        .delete(StagesTable)
        .where(and(eq(StagesTable.id, stageId), eq(StagesTable.tripId, tripId)))
        .returning({ id: StagesTable.id });
    const data = await query.get();

    if (!data) throw new HTTPException(404, { message: `Stage with id '${stageId}' not found` });
    return ctx.body(null, 204);
};
