import { StagesTable, TripsTable } from "@db/schemas";
import { StagePreview } from "@models/stages";
import { SetTrip, Trip } from "@models/trips";
import { canFilter, filterColumns, subFields } from "@utils/filter_object";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { ZodError } from "zod";

export const updateTrip: Handler<Env> = async (ctx) => {
    const tripId = ctx.req.param("trip_id");
    const fields = ctx.req.query("fields")?.split(",");
    const columns = {
        id: TripsTable.id,
        name: TripsTable.name,
        date: TripsTable.date,
        title: TripsTable.title,
        description: TripsTable.description,
        image: TripsTable.image,
        video: TripsTable.video,
        content: TripsTable.content,
        keywords: TripsTable.keywords,
        published: TripsTable.published,
        url: sql`CONCAT(${ctx.env.HOST}, '/', ${TripsTable.id})`,
        createdAt: TripsTable.createdAt,
        updatedAt: TripsTable.updatedAt
    };

    try {
        const body = SetTrip.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .update(TripsTable)
            .set(body)
            .where(eq(TripsTable.id, tripId))
            .returning(filterColumns(columns, fields));

        // Update trip
        const data: any = await query.get();

        if (!data) throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });
        // Get satges
        if (canFilter("stages", fields)) {
            const columns = {
                name: StagesTable.name,
                date: StagesTable.date,
                title: StagesTable.title,
                description: StagesTable.description,
                image: StagesTable.image,
                url: sql`CONCAT(${ctx.env.HOST}, '/', ${StagesTable.tripId}, '/', ${StagesTable.id})`
            };
            const query = drizzle(ctx.env.DB)
                .select(filterColumns(columns, subFields("stages", fields)))
                .from(StagesTable)
                .where(and(eq(StagesTable.tripId, tripId), eq(StagesTable.published, true)));

            data.stages = await query.then((e) => e.map((e) => StagePreview.parse(e)));
        }
        return ctx.json(Trip.parse(data), 200);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: `Impossible to update trip with id ${tripId}`
            });
        throw err;
    }
};
