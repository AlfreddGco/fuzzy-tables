import { z } from "zod";

export enum FieldType {
	SingleLine = "string",
	Date = "date",
	Checkbox = "boolean",
	MultipleSelect = "string[]",
	SingleSelect = "single-select",
	ObjectArray = "object[]",
	Undefined = "undefined",
	Null = "null",
}

export const inferTypeFromValue = (value: unknown): FieldType => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
	if (value instanceof Date) return FieldType.Date;
	if (typeof value === "string" && dateRegex.test(value)) {
		return FieldType.Date;
	}
	if (value === undefined) return FieldType.Undefined;
	if (value === null) return FieldType.Null;
	if (value === "true" || value === true) return FieldType.Checkbox;
	if (value === "false" || value === false) return FieldType.Checkbox;
	if (
		Array.isArray(value) &&
		value.length > 0 &&
		value.some((v) => typeof v === "object" && v !== null)
	) {
		return FieldType.ObjectArray;
	}
	if (Array.isArray(value)) {
		return FieldType.MultipleSelect;
	}
	return FieldType.SingleLine;
};

export const categorizeNestedField = (
	path: string,
	zSchema: z.ZodType,
): FieldType.SingleLine | FieldType.Date | FieldType.Checkbox | FieldType.SingleSelect => {
	const getNestedType = (
		type: z.ZodType | z.ZodRawShape,
		parts: string[],
	): z.ZodType | null => {
		if (parts.length === 0) return type instanceof z.ZodType ? type : null;
		if (!type || typeof type !== "object") return null;

		const [current, ...rest] = parts;
		let nextType: z.ZodType | unknown;

		if (type instanceof z.ZodObject) {
			nextType = type.shape[current];
		} else if (typeof type === "object" && current in type) {
			nextType = type[current as keyof typeof type];
		} else {
			return null;
		}

		return nextType instanceof z.ZodType ? getNestedType(nextType, rest) : null;
	};

	const finalType = getNestedType(
		zSchema instanceof z.ZodObject ? zSchema.shape : {},
		path.split("."),
	);
	if (!finalType) return FieldType.SingleLine;

	// Unwrap any wrapped types (like ZodDefault or ZodEffects)
	const unwrappedType =
		finalType instanceof z.ZodEffects ? finalType._def.schema : finalType;
	const innerType = unwrappedType._def?.innerType ?? unwrappedType;

	if (innerType instanceof z.ZodDate) return FieldType.Date;
	if (innerType instanceof z.ZodBoolean) return FieldType.Checkbox;
	if (innerType instanceof z.ZodEnum) return FieldType.SingleSelect;
	return FieldType.SingleLine;
};

export const getEnumOptions = (
	path: string,
	zSchema: z.ZodType,
): string[] | null => {
	const getNestedType = (
		type: z.ZodType | z.ZodRawShape,
		parts: string[],
	): z.ZodType | null => {
		if (parts.length === 0) return type instanceof z.ZodType ? type : null;
		if (!type || typeof type !== "object") return null;

		const [current, ...rest] = parts;
		let nextType: z.ZodType | unknown;

		if (type instanceof z.ZodObject) {
			nextType = type.shape[current];
		} else if (typeof type === "object" && current in type) {
			nextType = type[current as keyof typeof type];
		} else {
			return null;
		}

		return nextType instanceof z.ZodType ? getNestedType(nextType, rest) : null;
	};

	const finalType = getNestedType(
		zSchema instanceof z.ZodObject ? zSchema.shape : {},
		path.split("."),
	);
	if (!finalType) return null;

	// Unwrap any wrapped types (like ZodDefault or ZodEffects)
	const unwrappedType =
		finalType instanceof z.ZodEffects ? finalType._def.schema : finalType;
	const innerType = unwrappedType._def?.innerType ?? unwrappedType;

	if (innerType instanceof z.ZodEnum) {
		return innerType.options;
	}
	return null;
};
