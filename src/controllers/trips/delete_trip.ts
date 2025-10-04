import { TripsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const deleteTrip: Handler<Env> = async (ctx) => {
    const tripId = ctx.req.param("trip_id");
    const query = drizzle(ctx.env.DB)
        .delete(TripsTable)
        .where(eq(TripsTable.id, tripId))
        .returning({ id: TripsTable.id });
    // Delete trip
    const data = await query.get();

    if (!data) throw new HTTPException(404, { message: `Trip with id '${tripId}' not found` });
    return ctx.body(null, 204);
};
