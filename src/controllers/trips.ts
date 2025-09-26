import { HTTPException } from "hono/http-exception";
import type { Handler } from "hono/types";

export const getAllTrips: Handler = async (ctx) => {
    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};

export const getTripById: Handler = async (ctx) => {
    const tripId = ctx.req.param("trip_id");

    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};

export const createTrip: Handler = async (ctx) => {
    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};

export const updateTrip: Handler = async (ctx) => {
    const tripId = ctx.req.param("trip_id");

    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};

export const deleteTrip: Handler = async (ctx) => {
    const tripId = ctx.req.param("trip_id");

    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};
