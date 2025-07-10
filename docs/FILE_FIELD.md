# File Field Documentation

The fuzzy-tables library now supports file uploads with automatic validation that works seamlessly on both client and server sides.

## Overview

The file field provides:

- Client-side validation for `File` instances
- Server-side validation for file reference objects
- Automatic UI rendering in forms
- Manual UI rendering for tables
- Type-safe validation with Zod schemas

## Basic Usage

### 1. Import the file schema

```typescript
import { fileSchema } from "fuzzy-tables";
```

### 2. Define fields with file validation

```typescript
const fields = [
  {
    field: "avatar" as const,
    header: "Profile Picture",
    z: fileSchema(), // Required file
  },
  {
    field: "resume" as const,
    header: "Resume",
    z: fileSchema().optional(), // Optional file
  },
];
```
### 3. Generate your schema and its type from fields
```typescript
import { z } from "zod";
import { zodFromFields } from "fuzzy-tables/types";
const schema = zodFromFields(fields);
type Schema = z.infer<typeof schema>;
```

### 4. Use in forms and tables

```typescript
const MyTable = buildTable(fields);
/*
  data is typed!! ({
    avatar: File | { key: string, upload_signature: string, url?: string,
    resume?: File | { key: string, upload_signature: string, url?: string }
  })
*/ 
const MyForm = <CreateForm<Schema> fields={fields} onSubmit={(data) => {}} />;
```

## File Upload Flow

When implementing file uploads, follow this pattern:

### Client-Side (Form Submission)

```typescript
const handleSubmit = async (formData) => {
  // 1. Check if we have file fields
  if (formData.avatar instanceof File) {
    // 2. Request signed upload URL from your API
    const { uploadUrl, key, signature } = await api.getSignedUploadUrl({
      filename: formData.avatar.name,
      contentType: formData.avatar.type,
    });

    // 3. Upload file to signed URL
    await fetch(uploadUrl, {
      method: "PUT",
      body: formData.avatar,
      headers: {
        "Content-Type": formData.avatar.type,
      },
    });

    // 4. Replace File with reference object
    formData.avatar = { key, upload_signature: signature };
  }

  // 5. Submit form with file references
  await api.createRecord(formData);
};
```

### Server-Side (API Endpoint)

```typescript
// The same field definition works on the server
const serverSchema = zodFromFields(fields);

app.post("/api/records", async (req, res) => {
  // Validates that avatar has { key, upload_signature }
  const validated = serverSchema.parse(req.body);

  // Store the file reference in your database
  await db.records.create(validated);
});
```

## Validation Types

The `fileSchema()` creates a Zod union that accepts:

### Client-side

```typescript
// File instance
const file = new File(["content"], "document.pdf", { type: "application/pdf" });
```

### Server-side

```typescript
// File reference object
const fileRef = {
  key: "uploads/123/document.pdf",
  upload_signature: "abc123xyz",
};
```

## UI Behavior

### In Forms

- Shows a file picker button
- Displays selected filename or "No file chosen"
- If file is type File and is an image, displays image preview
- If file is type Object and url is image on remote url OR base64 string, displays image preview
- If file is type File and NOT an image, displays file icon and filename
- If file is type Object and url is NOT image, displays file icon

## Example Implementation

```typescript
import { z } from 'zod';
import { fileSchema, buildTable, CreateForm } from 'fuzzy-tables';
import { zodFromFields } from "fuzzy-tables/types";

// Define your fields
const userFields = [
  {
    field: 'name' as const,
    header: 'Name',
    z: z.string().min(2),
  },
  {
    field: 'avatar' as const,
    header: 'Avatar',
    z: fileSchema(),
  },
];

const schema = zodFromFields(fields);
type Schema = z.infer<typeof schema>;

// Create table and forms
const UserTable = buildTable(userFields);

// Handle file uploads
const handleCreateUser = async (formData) => {
  // Single file
  if (formData.avatar instanceof File) {
    // request PUT signed URL and upload_signature to your API
    // upload file to your cloud storage provider
    // upload full record & avatar: { key, upload_signature }
  }
};

// Use in your component
<CreateForm<Schema>
  fields={userFields}
  onSubmit={handleCreateUser}
  title="Add User"
/>

// Display in table with CDN URLs
const userData = [
  {
    id: '1',
    name: 'John',
    avatar: 'https://cdn.example.com/avatars/john.jpg', // Shows as thumbnail
    gallery: [
      'https://cdn.example.com/img1.jpg', // Shows as thumbnail grid
      'https://cdn.example.com/img2.jpg',
      'https://cdn.example.com/img3.jpg',
      'https://cdn.example.com/img4.jpg', // +1 more indicator
    ],
    attachments: [
      'https://cdn.example.com/docs/doc1.pdf', // Shows as "📎 2 files"
      'https://cdn.example.com/docs/doc2.pdf',
    ],
  },
];
```

## Security Considerations

1. **Always validate file types and sizes on the server**
2. **Use signed URLs with expiration for uploads**
3. **Store files in a secure location (S3, GCS, etc.)**

## Integration with Cloud Storage

The file field is designed to work with any cloud storage provider:

### AWS S3 Example

```typescript
const getSignedUploadUrl = async (filename: string) => {
  const key = `uploads/${userId}/${Date.now()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: "my-bucket",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return { url, key, signature: generateSignature(key) };
};
```

### Google Cloud Storage Example

```typescript
const getSignedUploadUrl = async (filename: string) => {
  const file = bucket.file(`uploads/${userId}/${Date.now()}-${filename}`);
  const [url] = await file.getSignedUrl({
    action: "write",
    expires: Date.now() + 3600 * 1000,
  });
  return { url, key: file.name, signature: generateSignature(file.name) };
};
```

## Best Practices

1. **Use CDN URLs for display**: When fetching records, replace file references with CDN URLs for better table display
2. **Implement image optimization**: For thumbnails, use image transformation services
3. **Add loading states**: Show placeholders while images load
4. **Handle errors gracefully**: Images may fail to load, provide fallbacks
5. **Batch uploads**: When handling arrays, upload files in parallel with Promise.all()

## Limitations

- File preview on tables is not built-in to keep codebase simple (implement your own if needed)
- File type restrictions should be added as additional validations on your submit function
- File size validation should be implemented separately
- Currently only supporting single file on field. Soon supporting multiple files on field.
