import React, { useState } from "react";
import { z } from "zod";
import { SidebarField } from "../../src/components/Forms/Field";
import { categorizeNestedField, getEnumOptions } from "../../src/lib/fields";

// Example schema with array of enum fields
const exampleSchema = z.object({
	name: z.string(),
	skills: z.array(z.enum([
		"JavaScript",
		"TypeScript",
		"React",
		"Vue",
		"Angular",
		"Node.js",
		"Python",
		"Java",
		"Go",
		"Rust"
	])),
	hobbies: z.array(z.enum([
		"Reading",
		"Gaming",
		"Sports",
		"Music",
		"Cooking",
		"Travel",
		"Photography",
		"Writing"
	])),
	permissions: z.array(z.enum([
		"read",
		"write",
		"delete",
		"admin",
		"create",
		"update",
		"execute",
		"manage"
	])),
});

type FormData = z.infer<typeof exampleSchema>;

export function MultipleSelectExample() {
	const [data, setData] = useState<FormData>({
		name: "John Doe",
		skills: ["JavaScript", "React", "TypeScript"],
		hobbies: ["Reading", "Gaming"],
		permissions: ["read", "write"],
	});

	const [errors, setErrors] = useState<Record<string, string | null>>({});
	const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

	const handleFieldChange = (field: string, value: unknown) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error when field is changed
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: null,
			}));
		}
	};

	const handleBlur = (field: string) => {
		setTouchedFields((prev) => new Set([...prev, field]));
		validateField(field);
	};

	const validateField = (field: string) => {
		try {
			const fieldSchema = exampleSchema.shape[field as keyof typeof exampleSchema.shape];
			fieldSchema.parse(data[field as keyof FormData]);
			setErrors((prev) => ({
				...prev,
				[field]: null,
			}));
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors((prev) => ({
					...prev,
					[field]: error.errors[0]?.message || "Invalid value",
				}));
			}
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const validatedData = exampleSchema.parse(data);
			console.log("Form submitted with data:", validatedData);
			alert("Form submitted successfully! Check console for data.");
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: Record<string, string> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						newErrors[err.path[0].toString()] = err.message;
					}
				});
				setErrors(newErrors);
			}
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Multiple Select Example</h1>
			<p className="text-gray-600 mb-8">
				This example demonstrates the MultipleSelect field type for fields that are z.array(z.enum(...)). 
				Each option is colored using the rainbow palette, and you can select multiple values using checkboxes.
			</p>

			<form onSubmit={handleSubmit} className="space-y-6">
				<SidebarField
					field="name"
					header="Name"
					value={data.name}
					onChange={(value) => handleFieldChange("name", value)}
					onBlur={() => handleBlur("name")}
					error={errors.name}
				/>

				<SidebarField
					field="skills"
					header="Technical Skills"
					value={data.skills}
					onChange={(value) => handleFieldChange("skills", value)}
					onBlur={() => handleBlur("skills")}
					error={errors.skills}
					type={categorizeNestedField("skills", exampleSchema)}
					options={getEnumOptions("skills", exampleSchema) || []}
				/>

				<SidebarField
					field="hobbies"
					header="Hobbies & Interests"
					value={data.hobbies}
					onChange={(value) => handleFieldChange("hobbies", value)}
					onBlur={() => handleBlur("hobbies")}
					error={errors.hobbies}
					type={categorizeNestedField("hobbies", exampleSchema)}
					options={getEnumOptions("hobbies", exampleSchema) || []}
				/>

				<SidebarField
					field="permissions"
					header="User Permissions"
					value={data.permissions}
					onChange={(value) => handleFieldChange("permissions", value)}
					onBlur={() => handleBlur("permissions")}
					error={errors.permissions}
					type={categorizeNestedField("permissions", exampleSchema)}
					options={getEnumOptions("permissions", exampleSchema) || []}
				/>

				<div className="pt-4">
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					>
						Submit Form
					</button>
				</div>
			</form>

			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-lg font-semibold mb-4">Current Form Data:</h2>
				<pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
					{JSON.stringify(data, null, 2)}
				</pre>
			</div>

			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h2 className="text-lg font-semibold mb-4">Features:</h2>
				<ul className="list-disc list-inside space-y-2 text-sm">
					<li>Automatically detects z.array(z.enum(...)) fields as MultipleSelect</li>
					<li>Each option is colored using the rainbow palette for visual distinction</li>
					<li>Click to open dropdown with checkboxes for each option</li>
					<li>Selected values are displayed as colored tags</li>
					<li>Uses lodash's _.xor for toggling selections</li>
					<li>Maximum height with scroll for long option lists</li>
					<li>Click outside to close the dropdown</li>
					<li>Full validation support with Zod schemas</li>
				</ul>
			</div>
		</div>
	);
}