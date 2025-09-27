import { TripsTable } from "@db/schemas";
import { SetTrip } from "@models/trips";
import { canFilter, filterColumns } from "@utils/filter_object";
import { DrizzleQueryError, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import type { Handler } from "hono/types";
import { ZodError } from "zod";

export const updateTrip: Handler = async (ctx) => {
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
        url: sql`CONCAT('https://', ${ctx.env.HOST}, '/', ${TripsTable.id})`,
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

        // Create trip
        const data: any = await query.get();

        if (!data) throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

        // Get satges
        if (canFilter("stages", fields)) {
            data.stages = [];
        }

        return ctx.json(data, 200);
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
