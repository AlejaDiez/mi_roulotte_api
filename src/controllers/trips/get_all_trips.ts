import { TripsTable } from "@db/schemas";
import { ExtendedTripPreview, TripPreview } from "@models/trips";
import { checkRole } from "@utils/auth_role";
import { filterColumns } from "@utils/filter_object";
import { asc, count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Handler } from "hono/types";

export const getAllTrips: Handler<Env> = async (ctx) => {
    const privileges = checkRole(ctx, "editor", (u, r) => u >= r);
    const fields = ctx.req.query("fields")?.split(",");
    const page = ctx.req.query("page") ? Number(ctx.req.query("page")) : undefined;
    const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : undefined;
    const paginated = page && !isNaN(page) && limit && !isNaN(limit) && limit > 0;
    const columns = {
        id: TripsTable.id,
        name: TripsTable.name,
        date: TripsTable.date,
        title: TripsTable.title,
        description: TripsTable.description,
        image: TripsTable.image,
        video: TripsTable.video,
        published: TripsTable.published,
        url: sql<string>`CONCAT(${ctx.env.HOST}, '/', ${TripsTable.id})`
    };
    const query = drizzle(ctx.env.DB)
        .select(filterColumns(columns, fields))
        .from(TripsTable)
        .orderBy(asc(TripsTable.date));
    if (!privileges) query.where(eq(TripsTable.published, true));
    if (paginated) query.offset((page - 1) * limit).limit(limit);

    // Get all trips
    const data = await query.then((e) =>
        e.map((e) => (privileges ? ExtendedTripPreview.parse(e) : TripPreview.parse(e)))
    );

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
