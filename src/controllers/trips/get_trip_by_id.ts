import { TripsTable } from "@db/schemas";
import { Trip } from "@models/trips";
import { canFilter, filterColumns } from "@utils/filter_object";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import type { Handler } from "hono/types";

export const getTripById: Handler = async (ctx) => {
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
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(TripsTable)
        .where(and(eq(TripsTable.id, tripId), eq(TripsTable.published, true)));

    // Run query
    const data: any = await query.get();

    if (!data) throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });

    // Get satges
    if (canFilter("stages", fields)) {
        data.stages = [];
    }

    return ctx.json(Trip.partial().parse(data), 200);
};
