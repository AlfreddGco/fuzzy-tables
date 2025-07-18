import { z } from "zod";
import { isFileSchema } from "./schemas/file";

export const FIELD_TYPES = {
  SingleLine: 'SingleLine',
  Date: 'Date',
  Checkbox: 'Checkbox',
  MultipleSelect: 'MultipleSelect',
  SingleSelect: 'SingleSelect',
  ObjectArray: 'ObjectArray',
  Undefined: 'Undefined',
  Null: 'Null',
  File: 'File',
  MultipleFiles: 'MultipleFiles',
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export const inferTypeFromValue = (value: unknown): FieldType => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
	if (value instanceof Date) return FIELD_TYPES.Date;
	if (typeof value === "string" && dateRegex.test(value)) {
		return FIELD_TYPES.Date;
	}
	if (value === undefined) return FIELD_TYPES.Undefined;
	if (value === null) return FIELD_TYPES.Null;
	if (value === "true" || value === true) return FIELD_TYPES.Checkbox;
	if (value === "false" || value === false) return FIELD_TYPES.Checkbox;
	if (
		Array.isArray(value) &&
		value.length > 0 &&
		value.some((v) => typeof v === "object" && v !== null)
	) {
		return FIELD_TYPES.ObjectArray;
	}
	if (Array.isArray(value)) {
		return FIELD_TYPES.MultipleSelect;
	}
	return FIELD_TYPES.SingleLine;
};

export const categorizeNestedField = (
	path: string,
	zSchema: z.ZodType,
): typeof FIELD_TYPES["SingleLine" | "Date" | "Checkbox" | "SingleSelect" | "File" | "MultipleSelect" | "MultipleFiles"] => {
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
	if (!finalType) return FIELD_TYPES.SingleLine;

	// Unwrap any wrapped types (like ZodDefault or ZodEffects)
	const unwrappedType =
		finalType instanceof z.ZodEffects ? finalType._def.schema : finalType;
	const innerType = unwrappedType._def?.innerType ?? unwrappedType;

	if (innerType instanceof z.ZodDate) return FIELD_TYPES.Date;
	if (innerType instanceof z.ZodBoolean) return FIELD_TYPES.Checkbox;
	if (innerType instanceof z.ZodEnum) return FIELD_TYPES.SingleSelect;
	if (innerType instanceof z.ZodArray && innerType._def.type instanceof z.ZodEnum) {
		return FIELD_TYPES.MultipleSelect;
	}
	if (innerType instanceof z.ZodArray && isFileSchema(innerType._def.type)) {
		return FIELD_TYPES.MultipleFiles;
	}
	if (isFileSchema(innerType)) return FIELD_TYPES.File;
	return FIELD_TYPES.SingleLine;
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
	if (innerType instanceof z.ZodArray && innerType._def.type instanceof z.ZodEnum) {
		return innerType._def.type.options;
	}
	return null;
};
