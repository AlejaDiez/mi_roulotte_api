import { TripsTable } from "@db/schemas";
import { InsertTrip, Trip } from "@models/trips";
import { canFilter, filterColumns } from "@utils/filter_object";
import { DrizzleQueryError, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";
import { ZodError } from "zod";

export const insertTrip: Handler<Env> = async (ctx) => {
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
        const body = InsertTrip.parse(await ctx.req.json());
        const query = drizzle(ctx.env.DB)
            .insert(TripsTable)
            .values(body)
            .returning(filterColumns(columns, fields));

        // Insert trip
        const data: any = await query.get();

        if (canFilter("stages", fields)) {
            data.stages = [];
        }
        return ctx.json(Trip.parse(data), 201);
    } catch (err) {
        if (err instanceof ZodError)
            throw new HTTPException(422, {
                message: err.issues.map(({ path, message }) => `${path} ${message}`).join("; ")
            });
        else if (err instanceof DrizzleQueryError)
            throw new HTTPException(409, {
                message: "Impossible to insert trip"
            });
        throw err;
    }
};
