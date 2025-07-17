import { describe, it, expect } from "vitest";
import { z } from "zod";
import { categorizeNestedField, getEnumOptions, FIELD_TYPES } from "./fields";
import { fileSchema } from "./schemas/file";

describe("categorizeNestedField", () => {
  it("should categorize z.string() as SingleLine", () => {
    const schema = z.object({
      name: z.string(),
    });
    
    const result = categorizeNestedField("name", schema);
    expect(result).toBe(FIELD_TYPES.SingleLine);
  });

  it("should categorize z.date() as Date", () => {
    const schema = z.object({
      createdAt: z.date(),
    });
    
    const result = categorizeNestedField("createdAt", schema);
    expect(result).toBe(FIELD_TYPES.Date);
  });

  it("should categorize z.boolean() as Checkbox", () => {
    const schema = z.object({
      isActive: z.boolean(),
    });
    
    const result = categorizeNestedField("isActive", schema);
    expect(result).toBe(FIELD_TYPES.Checkbox);
  });

  it("should categorize z.enum() as SingleSelect", () => {
    const schema = z.object({
      status: z.enum(["active", "inactive", "pending"]),
    });
    
    const result = categorizeNestedField("status", schema);
    expect(result).toBe(FIELD_TYPES.SingleSelect);
  });

  it("should categorize z.array(z.enum()) as MultipleSelect", () => {
    const schema = z.object({
      skills: z.array(z.enum(["JavaScript", "TypeScript", "Python", "Go"])),
    });
    
    const result = categorizeNestedField("skills", schema);
    expect(result).toBe(FIELD_TYPES.MultipleSelect);
  });

  it("should categorize z.array(fileSchema()) as MultipleFiles", () => {
    const schema = z.object({ documents: z.array(fileSchema()) });
    const result = categorizeNestedField("documents", schema);
    expect(result).toBe(FIELD_TYPES.MultipleFiles);
  });

  it("should categorize nested z.array(z.enum()) as MultipleSelect", () => {
    const schema = z.object({
      user: z.object({
        permissions: z.array(z.enum(["read", "write", "delete", "admin"])),
      }),
    });
    
    const result = categorizeNestedField("user.permissions", schema);
    expect(result).toBe(FIELD_TYPES.MultipleSelect);
  });

  it("should handle z.array(z.enum()).optional() as MultipleSelect", () => {
    const schema = z.object({
      tags: z.array(z.enum(["urgent", "bug", "feature", "enhancement"])).optional(),
    });
    
    const result = categorizeNestedField("tags", schema);
    expect(result).toBe(FIELD_TYPES.MultipleSelect);
  });

  it("should handle z.array(z.enum()).default([]) as MultipleSelect", () => {
    const schema = z.object({
      categories: z.array(z.enum(["tech", "lifestyle", "business", "health"])).default([]),
    });
    
    const result = categorizeNestedField("categories", schema);
    expect(result).toBe(FIELD_TYPES.MultipleSelect);
  });

  it("should handle z.array(z.string()) as MultipleSelect (not enum)", () => {
    const schema = z.object({
      items: z.array(z.string()),
    });
    
    // This should not be categorized as MultipleSelect since it's not an enum array
    const result = categorizeNestedField("items", schema);
    expect(result).toBe(FIELD_TYPES.SingleLine);
  });
});

describe("getEnumOptions", () => {
  it("should extract options from z.enum()", () => {
    const schema = z.object({
      status: z.enum(["active", "inactive", "pending"]),
    });
    
    const result = getEnumOptions("status", schema);
    expect(result).toEqual(["active", "inactive", "pending"]);
  });

  it("should extract options from z.array(z.enum())", () => {
    const schema = z.object({
      skills: z.array(z.enum(["JavaScript", "TypeScript", "Python", "Go"])),
    });
    
    const result = getEnumOptions("skills", schema);
    expect(result).toEqual(["JavaScript", "TypeScript", "Python", "Go"]);
  });

  it("should extract options from nested z.array(z.enum())", () => {
    const schema = z.object({
      user: z.object({
        permissions: z.array(z.enum(["read", "write", "delete", "admin"])),
      }),
    });
    
    const result = getEnumOptions("user.permissions", schema);
    expect(result).toEqual(["read", "write", "delete", "admin"]);
  });

  it("should handle optional z.array(z.enum())", () => {
    const schema = z.object({
      tags: z.array(z.enum(["urgent", "bug", "feature", "enhancement"])).optional(),
    });
    
    const result = getEnumOptions("tags", schema);
    expect(result).toEqual(["urgent", "bug", "feature", "enhancement"]);
  });

  it("should handle z.array(z.enum()) with default value", () => {
    const schema = z.object({
      categories: z.array(z.enum(["tech", "lifestyle", "business", "health"])).default([]),
    });
    
    const result = getEnumOptions("categories", schema);
    expect(result).toEqual(["tech", "lifestyle", "business", "health"]);
  });

  it("should return null for non-enum fields", () => {
    const schema = z.object({
      name: z.string(),
      count: z.number(),
      items: z.array(z.string()),
    });
    
    expect(getEnumOptions("name", schema)).toBeNull();
    expect(getEnumOptions("count", schema)).toBeNull();
    expect(getEnumOptions("items", schema)).toBeNull();
  });

  it("should return null for non-existent fields", () => {
    const schema = z.object({
      name: z.string(),
    });
    
    const result = getEnumOptions("nonExistent", schema);
    expect(result).toBeNull();
  });
});