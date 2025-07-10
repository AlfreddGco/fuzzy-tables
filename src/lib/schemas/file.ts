import { z } from "zod";

/**
 * Custom Zod schema for file validation that works on both client and server.
 *
 * Client-side: Validates that the value is a File instance
 * Server-side: Validates that the value contains file reference data
 *
 * @example
 * // In your field definition:
 * {
 *   field: "avatar",
 *   header: "Avatar",
 *   z: fileSchema()
 * }
 *
 * @example
 * // Client-side usage:
 * const form = { avatar: new File(["content"], "photo.jpg") }
 *
 * @example
 * // Server-side usage:
 * const form = { avatar: { key: "uploads/123/photo.jpg", upload_signature: "xyz123", url: "https://cdn.com/uploads/123/photo.jpg" } }
 */
export const fileSchema = () => {
  return z.union([
    // Client-side validation: File instance
    z.instanceof(File),
    // Server-side validation: File reference object
    z.object({
      key: z.string().min(1, "File key is required"),
      upload_signature: z.string().min(1, "Upload signature is required"),
      // URL To render images when editing a record
      url: z.string().optional(),
    }),
  ]);
};

type FileSchema = ReturnType<typeof fileSchema>;

/**
 * Type guard to check if a Zod schema is a file schema
 */
export const isFileSchema = (schema: z.ZodTypeAny): schema is FileSchema => {
  // Check if it's a union schema (which fileSchema returns)
  if (schema instanceof z.ZodUnion) {
    const options = schema.options;
    // Check if one option is ZodType for File and another is an object with key/upload_signature
    const emptyFile = new File([], "test.txt");
    const hasFileInstance = options.some((option: z.ZodTypeAny) => {
      const safe = option.safeParse(emptyFile)
      return safe.success;
    });
    const hasFileReference = options.some((option: z.ZodTypeAny) =>
      option instanceof z.ZodObject &&
      option.shape.key instanceof z.ZodString &&
      option.shape.upload_signature instanceof z.ZodString
    );
    return hasFileInstance && hasFileReference;
  }
  return false;
};
