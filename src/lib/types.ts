import { z } from "zod";
import _ from "lodash";

export type GenericRecord = { id?: string; [key: string]: unknown };
export type TableRow = GenericRecord & { id: string };

type ExtractZodType<T extends z.ZodType> = T extends z.ZodString
	? string
	: T extends z.ZodNumber
		? number
		: T extends z.ZodDate
			? Date
			: T extends z.ZodBoolean
				? boolean
				: T extends z.ZodDefault<infer U extends z.ZodType>
					? ExtractZodType<U>
					: T extends z.ZodEffects<infer U extends z.ZodType>
						? ExtractZodType<U>
						: T extends z.ZodNullable<infer U extends z.ZodType>
							? ExtractZodType<U> | null
							: never;

type NestedField<T extends { field: string; z: z.ZodType }> = T extends {
	field: `${infer Parent}.${infer Child}`;
	z: infer Z extends z.ZodType;
}
	? {
			[P in Parent]: {
				[C in Child]: ExtractZodType<Z>;
			};
		}
	: T extends { field: infer F extends string; z: infer Z extends z.ZodType }
		? {
				[P in F]: ExtractZodType<Z>;
			}
		: never;

type MergeFields<T> = T extends Record<string, unknown>
	? {
			[K in keyof T]: T[K] extends Record<string, unknown>
				? MergeFields<T[K]>
				: T[K];
		}
	: T;

type UnionToIntersection<U> = (
	U extends unknown
		? (k: U) => void
		: never
) extends (k: infer I) => void
	? I
	: never;

type ZodFromFieldsResult<T extends { field: string; z: z.ZodType }[]> =
	MergeFields<UnionToIntersection<NestedField<T[number]>>>;

export const zodFromFields = <
	T extends { field: string; header: string; z: z.ZodType }[],
>(
	fields: T,
) => {
	const shape = fields.reduce(
		(acc, field) => {
			const parts = field.field.split(".");
			if (parts.length === 0) return acc;

			const lastPart = parts.pop() || field.field;
			let current = acc;

			for (const part of parts) {
				if (!(part in current)) {
					current[part] = {};
				}
				current = current[part] as Record<string, unknown>;
			}
			current[lastPart] = field.z;
			return acc;
		},
		{} as Record<string, unknown>,
	);

	const makeZodObject = (obj: Record<string, unknown>): z.ZodType => {
		const zodShape: Record<string, z.ZodType> = {};
		for (const [key, value] of Object.entries(obj)) {
			zodShape[key] =
				"_def" in (value as object)
					? (value as z.ZodType)
					: makeZodObject(value as Record<string, unknown>);
		}
		return z.object(zodShape);
	};

	return makeZodObject(shape) as z.ZodObject<
		z.ZodRawShape,
		"strip",
		z.ZodTypeAny,
		ZodFromFieldsResult<T>
	>;
};
