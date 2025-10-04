import { StagesTable, TripsTable } from "@db/schemas";
import { StagePreview } from "@models/stages";
import { filterColumns } from "@utils/filter_object";
import { and, count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const getAllStages: Handler<Env> = async (ctx) => {
    const tripId = ctx.req.param("trip_id");
    const fields = ctx.req.query("fields")?.split(",");
    const page = ctx.req.query("page") ? Number(ctx.req.query("page")) : undefined;
    const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : undefined;
    const paginated = page && !isNaN(page) && limit && !isNaN(limit) && limit > 0;
    const columns = {
        name: StagesTable.name,
        date: StagesTable.date,
        title: StagesTable.title,
        description: StagesTable.description,
        image: StagesTable.image,
        url: sql`CONCAT(${ctx.env.HOST}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`
    };

    // Trip exists?
    const tripQuery = drizzle(ctx.env.DB)
        .select({ id: TripsTable.id })
        .from(TripsTable)
        .where(and(eq(TripsTable.id, tripId), eq(TripsTable.published, true)));
    const tripExists = await tripQuery.get();

    if (!tripExists)
        throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

    // Get all stages
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(StagesTable)
        .where(and(eq(StagesTable.tripId, tripId), eq(StagesTable.published, true)));

    // Paginate
    if (paginated) {
        query.offset((page - 1) * limit).limit(limit);
    }

    const data = await query.then((e) => e.map((e) => StagePreview.parse(e)));

    // Get pagination info
    if (paginated) {
        const num = await drizzle(ctx.env.DB)
            .select({
                count: count()
            })
            .from(StagesTable)
            .where(and(eq(StagesTable.tripId, tripId), eq(StagesTable.published, true)))
            .get()
            .then((e) => e!.count);

        return ctx.json(
            {
                page: page > 1 ? page : 1,
                totalPages: Math.ceil(num / limit),
                items: data.length,
                totalItems: num,
                data
            },
            200
        );
    }
    return ctx.json(data, 200);
};
