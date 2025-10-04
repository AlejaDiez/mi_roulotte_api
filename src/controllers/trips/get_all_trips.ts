import { TripsTable } from "@db/schemas";
import { TripPreview } from "@models/trips";
import { filterColumns } from "@utils/filter_object";
import { count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Handler } from "hono/types";

export const getAllTrips: Handler<Env> = async (ctx) => {
    const fields = ctx.req.query("fields")?.split(",");
    const page = ctx.req.query("page") ? Number(ctx.req.query("page")) : undefined;
    const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : undefined;
    const paginated = page && !isNaN(page) && limit && !isNaN(limit) && limit > 0;
    const columns = {
        name: TripsTable.name,
        date: TripsTable.date,
        title: TripsTable.title,
        description: TripsTable.description,
        image: TripsTable.image,
        video: TripsTable.video,
        url: sql`CONCAT(${ctx.env.HOST}, '/', ${TripsTable.id})`
    };
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(TripsTable)
        .where(eq(TripsTable.published, true));

    // Paginate
    if (paginated) {
        query.offset((page - 1) * limit).limit(limit);
    }

    // Get all trips
    const data = await query.then((e) => e.map((e) => TripPreview.parse(e)));

    // Get pagination info
    if (paginated) {
        const num = await drizzle(ctx.env.DB)
            .select({
                count: count()
            })
            .from(TripsTable)
            .where(eq(TripsTable.published, true))
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
