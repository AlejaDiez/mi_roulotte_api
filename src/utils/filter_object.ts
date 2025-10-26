import { sql } from "drizzle-orm";
import { _ZodType, core, util, z } from "zod";

declare module "zod" {
    interface ZodObject<
        /** @ts-ignore Cast variance */
        out Shape extends core.$ZodShape = core.$ZodLooseShape,
        out Config extends core.$ZodObjectConfig = core.$strip
    > extends _ZodType<core.$ZodObjectInternals<Shape, Config>>,
            core.$ZodObject<Shape, Config> {
        filter<M extends string[]>(
            fields?: M
        ): ZodObject<util.Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>, Config>;
    }
}

z.ZodObject.prototype.filter = function (fields?: string[]) {
    const shape = this.shape;
    const keys = fields?.filter((k) => k in shape) ?? Object.keys(shape);
    const shapeSubset = Object.fromEntries(keys.map((k) => [k, shape[k]]));

    return z.object(shapeSubset);
};

export const canFilter = (field: string, fields: string[] | undefined) =>
    fields?.some((e) => e.includes(field)) ?? true;

export const subFields = (field: string, fields: string[] | undefined) =>
    fields?.filter((e) => e.includes(`${field}.`)).map((e) => e.replace(`${field}.`, "")) ?? [];

export const filterColumns = <T extends object>(columns: T, fields: string[] | undefined) => {
    if (!fields || fields.length === 0) {
        return columns;
    }

    const set = new Set(fields);
    const cols = Object.entries(columns).reduce((acc, [key, value]) => {
        if (key.startsWith("_") || set.has(key)) {
            return { ...acc, [key]: value };
        }
        return acc;
    }, {});

    if (Object.keys(cols).length === 0) {
        return { _: sql`'_'` };
    }
    return cols;
};
