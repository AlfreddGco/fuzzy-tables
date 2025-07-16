import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodFromFields } from "./types";

describe("zodFromFields", () => {
	it("should create a zod object from simple fields", () => {
		const fields = [
			{ field: "name", z: z.string() },
			{ field: "age", z: z.number() },
			{ field: "isActive", z: z.boolean() },
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.name).toBeInstanceOf(z.ZodString);
		expect(result.shape.age).toBeInstanceOf(z.ZodNumber);
		expect(result.shape.isActive).toBeInstanceOf(z.ZodBoolean);
	});

	it("should handle z.array(z.enum()) fields correctly", () => {
		const fields = [
			{
				field: "MultipleSelect",
				z: z.array(z.enum(["X", "Y", "Z"])),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.MultipleSelect).toBeInstanceOf(z.ZodArray);

		// Check that the array element type is ZodEnum
		const arrayType = result.shape.MultipleSelect as z.ZodArray<
			z.ZodEnum<["X", "Y", "Z"]>
		>;
		expect(arrayType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(arrayType._def.type.options).toEqual(["X", "Y", "Z"]);
	});

	it("should handle multiple z.array(z.enum()) fields", () => {
		const fields = [
			{
				field: "skills",
				z: z.array(z.enum(["JavaScript", "TypeScript", "Python", "Go"])),
			},
			{
				field: "permissions",
				z: z.array(z.enum(["read", "write", "delete", "admin"])),
			},
			{
				field: "name",
				z: z.string(),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.skills).toBeInstanceOf(z.ZodArray);
		expect(result.shape.permissions).toBeInstanceOf(z.ZodArray);
		expect(result.shape.name).toBeInstanceOf(z.ZodString);

		// Verify skills array
		const skillsType = result.shape.skills as z.ZodArray<z.ZodEnum<any>>;
		expect(skillsType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(skillsType._def.type.options).toEqual([
			"JavaScript",
			"TypeScript",
			"Python",
			"Go",
		]);

		// Verify permissions array
		const permissionsType = result.shape.permissions as z.ZodArray<
			z.ZodEnum<any>
		>;
		expect(permissionsType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(permissionsType._def.type.options).toEqual([
			"read",
			"write",
			"delete",
			"admin",
		]);
	});

	it("should handle optional z.array(z.enum()) fields", () => {
		const fields = [
			{
				field: "tags",
				z: z.array(z.enum(["urgent", "bug", "feature"])).optional(),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.tags).toBeInstanceOf(z.ZodOptional);

		// Unwrap the optional to get the array
		const optionalType = result.shape.tags as z.ZodOptional<
			z.ZodArray<z.ZodEnum<any>>
		>;
		const arrayType = optionalType._def.innerType as z.ZodArray<z.ZodEnum<any>>;
		expect(arrayType).toBeInstanceOf(z.ZodArray);
		expect(arrayType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(arrayType._def.type.options).toEqual(["urgent", "bug", "feature"]);
	});

	it("should handle z.array(z.enum()) with default values", () => {
		const fields = [
			{
				field: "categories",
				z: z.array(z.enum(["tech", "lifestyle", "business"])).default([]),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.categories).toBeInstanceOf(z.ZodDefault);

		// Unwrap the default to get the array
		const defaultType = result.shape.categories as z.ZodDefault<
			z.ZodArray<z.ZodEnum<any>>
		>;
		const arrayType = defaultType._def.innerType as z.ZodArray<z.ZodEnum<any>>;
		expect(arrayType).toBeInstanceOf(z.ZodArray);
		expect(arrayType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(arrayType._def.type.options).toEqual([
			"tech",
			"lifestyle",
			"business",
		]);
	});

	it("should handle nested fields", () => {
		const fields = [
			{ field: "user.name", z: z.string() },
			{ field: "user.email", z: z.string().email() },
			{
				field: "user.roles",
				z: z.array(z.enum(["admin", "user", "guest"])),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(result.shape.user).toBeInstanceOf(z.ZodObject);

		const userShape = (result.shape.user as z.ZodObject<any>).shape;
		expect(userShape.name).toBeInstanceOf(z.ZodString);
		expect(userShape.email).toBeInstanceOf(z.ZodString);
		expect(userShape.roles).toBeInstanceOf(z.ZodArray);

		// Verify roles array
		const rolesType = userShape.roles as z.ZodArray<z.ZodEnum<any>>;
		expect(rolesType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(rolesType._def.type.options).toEqual(["admin", "user", "guest"]);
	});

	it("should validate data correctly with z.array(z.enum()) fields", () => {
		const fields = [
			{ field: "name", z: z.string() },
			{
				field: "skills",
				z: z.array(z.enum(["JavaScript", "TypeScript", "Python"])),
			},
		];

		const schema = zodFromFields(fields);

		// Valid data
		const validData = {
			name: "John Doe",
			skills: ["JavaScript", "Python"],
		};

		const result = schema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validData);
		}

		// Invalid data - wrong enum value
		const invalidData = {
			name: "Jane Doe",
			skills: ["JavaScript", "Ruby"], // Ruby is not in the enum
		};

		const invalidResult = schema.safeParse(invalidData);
		expect(invalidResult.success).toBe(false);

		// Invalid data - not an array
		const notArrayData = {
			name: "Bob",
			skills: "JavaScript", // Should be an array
		};

		const notArrayResult = schema.safeParse(notArrayData);
		expect(notArrayResult.success).toBe(false);
	});

	it("should handle mixed field types including z.array(z.enum())", () => {
		const fields = [
			{ field: "id", z: z.string().uuid() },
			{ field: "name", z: z.string().min(2) },
			{ field: "age", z: z.number().positive() },
			{ field: "isActive", z: z.boolean() },
			{ field: "createdAt", z: z.date() },
			{ field: "status", z: z.enum(["active", "inactive", "pending"]) },
			{
				field: "tags",
				z: z.array(z.enum(["important", "urgent", "low-priority"])),
			},
			{
				field: "metadata",
				z: z.object({ key: z.string(), value: z.string() }),
			},
		];

		const result = zodFromFields(fields);

		expect(result).toBeInstanceOf(z.ZodObject);
		expect(Object.keys(result.shape)).toHaveLength(8);

		// Verify each field type
		expect(result.shape.id).toBeInstanceOf(z.ZodString);
		expect(result.shape.name).toBeInstanceOf(z.ZodString);
		expect(result.shape.age).toBeInstanceOf(z.ZodNumber);
		expect(result.shape.isActive).toBeInstanceOf(z.ZodBoolean);
		expect(result.shape.createdAt).toBeInstanceOf(z.ZodDate);
		expect(result.shape.status).toBeInstanceOf(z.ZodEnum);
		expect(result.shape.tags).toBeInstanceOf(z.ZodArray);
		expect(result.shape.metadata).toBeInstanceOf(z.ZodObject);

		// Verify tags array specifically
		const tagsType = result.shape.tags as z.ZodArray<z.ZodEnum<any>>;
		expect(tagsType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(tagsType._def.type.options).toEqual([
			"important",
			"urgent",
			"low-priority",
		]);
	});

	it("should handle the exact case mentioned: field 'MultipleSelect' with z.array(z.enum(['X', 'Y', 'Z']))", () => {
		const fields = [
			{
				field: "MultipleSelect" as const,
				z: z.array(z.enum(["X", "Y", "Z"])),
			},
		];

		const result = zodFromFields(fields);

		// Verify the result is a ZodObject
		expect(result).toBeInstanceOf(z.ZodObject);

		// Verify shape['MultipleSelect'] exists and is a ZodArray
		expect(result.shape["MultipleSelect"]).toBeDefined();
		expect(result.shape["MultipleSelect"]).toBeInstanceOf(z.ZodArray);

		// Verify the array contains z.enum
		const multipleSelectType = result.shape["MultipleSelect"] as z.ZodArray<
			z.ZodEnum<["X", "Y", "Z"]>
		>;
		expect(multipleSelectType._def.type).toBeInstanceOf(z.ZodEnum);
		expect(multipleSelectType._def.type.options).toEqual(["X", "Y", "Z"]);

		// Test parsing valid data
		const validData = { MultipleSelect: ["X", "Z"] };
		const parseResult = result.safeParse(validData);
		expect(parseResult.success).toBe(true);
		if (parseResult.success) {
			expect(parseResult.data).toEqual(validData);
		}

		// Test parsing invalid data
		const invalidData = { MultipleSelect: ["X", "W"] }; // 'W' is not in enum
		const invalidParseResult = result.safeParse(invalidData);
		expect(invalidParseResult.success).toBe(false);
	});
});
