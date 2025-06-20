import React, { useState } from "react";
import { z } from "zod";
import { SidebarField } from "../../src/components/Forms/Field";
import { categorizeNestedField, getEnumOptions } from "../../src/lib/fields";

// Example schema with enum field
const exampleSchema = z.object({
	name: z.string(),
	status: z.enum(["pending", "approved", "rejected", "in-review", "completed"]),
	priority: z.enum(["low", "medium", "high", "urgent"]),
	category: z.enum(["bug", "feature", "enhancement", "documentation", "test"]),
});

type ExampleData = z.infer<typeof exampleSchema>;

export function SingleSelectExample() {
	const [data, setData] = useState<ExampleData>({
		name: "Example Task",
		status: "pending",
		priority: "medium",
		category: "feature",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleFieldChange = (field: keyof ExampleData, value: unknown) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error when field is changed
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	};

	const handleBlur = (field: keyof ExampleData) => {
		// Validate on blur
		try {
			exampleSchema.shape[field].parse(data[field]);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors((prev) => ({
					...prev,
					[field]: error.errors[0]?.message || "Invalid value",
				}));
			}
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Single Select Example</h1>
			
			<div className="space-y-6 bg-white p-6 rounded-lg shadow">
				<SidebarField
					field="name"
					header="Task Name"
					value={data.name}
					onChange={(value) => handleFieldChange("name", value)}
					onBlur={() => handleBlur("name")}
					error={errors.name}
				/>

				<SidebarField
					field="status"
					header="Status"
					value={data.status}
					onChange={(value) => handleFieldChange("status", value)}
					onBlur={() => handleBlur("status")}
					error={errors.status}
					type={categorizeNestedField("status", exampleSchema)}
					options={getEnumOptions("status", exampleSchema) || []}
				/>

				<SidebarField
					field="priority"
					header="Priority"
					value={data.priority}
					onChange={(value) => handleFieldChange("priority", value)}
					onBlur={() => handleBlur("priority")}
					error={errors.priority}
					type={categorizeNestedField("priority", exampleSchema)}
					options={getEnumOptions("priority", exampleSchema) || []}
				/>

				<SidebarField
					field="category"
					header="Category"
					value={data.category}
					onChange={(value) => handleFieldChange("category", value)}
					onBlur={() => handleBlur("category")}
					error={errors.category}
					type={categorizeNestedField("category", exampleSchema)}
					options={getEnumOptions("category", exampleSchema) || []}
				/>

				<div className="mt-6 p-4 bg-gray-100 rounded">
					<h3 className="font-semibold mb-2">Current Data:</h3>
					<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
				</div>
			</div>

			<div className="mt-6 bg-blue-50 p-4 rounded-lg">
				<h3 className="font-semibold mb-2">Usage Notes:</h3>
				<ul className="list-disc list-inside space-y-1 text-sm">
					<li>The dropdown automatically detects z.enum() fields in your Zod schema</li>
					<li>Each option is colored using the rainbow utility colors</li>
					<li>The selected option shows with a colored indicator</li>
					<li>Options cycle through the available rainbow colors</li>
				</ul>
			</div>
		</div>
	);
}